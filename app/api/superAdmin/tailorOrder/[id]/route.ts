import { NextRequest, NextResponse } from "next/server";
import { tailorOrderUpdateSchema, tailorOrderPaymentSchema } from "@/app/validationSchema/tailorOrderSchema";
import prisma from "@/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tailorOrder = await prisma.tailorOrder.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            account: true,
          },
        },
        specifications: true,
      },
    });

    if (!tailorOrder) {
      return NextResponse.json(
        { error: "Tailor order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tailorOrder, { status: 200 });
  } catch (error) {
    console.error("Error fetching tailor order:", error);
    return NextResponse.json(
      { message: "Error fetching tailor order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const validation = tailorOrderUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    // Check if tailor order exists
    const existingOrder = await prisma.tailorOrder.findUnique({
      where: { id: params.id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Tailor order not found" },
        { status: 404 }
      );
    }

    // Verify account exists if provided
    if (body.accountId) {
      const account = await prisma.accounts.findUnique({
        where: { id: body.accountId },
      });

      if (!account) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }
    }

    // Calculate balance if totalPrice or paidAmount is being updated
    let balance = existingOrder.balance;
    if (body.totalPrice !== undefined || body.paidAmount !== undefined) {
      const newTotalPrice = body.totalPrice ?? existingOrder.totalPrice;
      const newPaidAmount = body.paidAmount ?? existingOrder.paidAmount;
      balance = newTotalPrice - newPaidAmount;
    }

    // Prepare update data
    const updateData: any = {
      ...body,
      balance,
    };

    // Convert deliveryDate to DateTime if provided
    if (body.deliveryDate) {
      updateData.deliveryDate = new Date(body.deliveryDate);
    }

    // Remove specifications from updateData as it will be handled separately
    const { specifications, ...orderUpdateData } = updateData;

    // Update tailor order
    const updatedTailorOrder = await prisma.tailorOrder.update({
      where: { id: params.id },
      data: orderUpdateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            account: true,
          },
        },
        specifications: true,
      },
    });

    // Update specifications if provided
    if (specifications) {
      // Delete existing specifications
      await prisma.tailorSpecification.deleteMany({
        where: { tailorOrderId: params.id },
      });

      // Create new specifications
      await prisma.tailorSpecification.createMany({
        data: specifications.map((spec: any) => ({
          tailorOrderId: params.id,
          shoulder: spec.shoulder,
          chest: spec.chest,
          waist: spec.waist,
          length: spec.length,
          sleeves: spec.sleeves,
          neck: spec.neck,
          hips: spec.hips,
          thigh: spec.thigh,
          bottom: spec.bottom,
          customMeasurements: spec.customMeasurements,
        })),
      });

      // Fetch updated order with specifications
      const finalOrder = await prisma.tailorOrder.findUnique({
        where: { id: params.id },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          account: {
            select: {
              id: true,
              account: true,
            },
          },
          specifications: true,
        },
      });

      return NextResponse.json(finalOrder, { status: 200 });
    }

    return NextResponse.json(updatedTailorOrder, { status: 200 });
  } catch (error: any) {
    console.error("Error updating tailor order:", error);
    return NextResponse.json(
      { message: "Error updating tailor order", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if tailor order exists
    const existingOrder = await prisma.tailorOrder.findUnique({
      where: { id: params.id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Tailor order not found" },
        { status: 404 }
      );
    }

    // Delete tailor order (specifications will be deleted automatically due to cascade)
    await prisma.tailorOrder.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Tailor order deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting tailor order:", error);
    return NextResponse.json(
      { message: "Error deleting tailor order", error: error.message },
      { status: 500 }
    );
  }
}
