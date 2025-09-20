import { NextRequest, NextResponse } from "next/server";
import { tailorOrderPaymentSchema } from "@/app/validationSchema/tailorOrderSchema";
import prisma from "@/prisma/client";

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
  const validation = tailorOrderPaymentSchema.safeParse(body);

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

    // Calculate new balance
    const balance = existingOrder.totalPrice - body.paidAmount;

    // Update payment details
    const updatedTailorOrder = await prisma.tailorOrder.update({
      where: { id: params.id },
      data: {
        paidAmount: body.paidAmount,
        balance,
        paymentType: body.paymentType,
        accountId: body.accountId,
      },
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

    return NextResponse.json(updatedTailorOrder, { status: 200 });
  } catch (error: any) {
    console.error("Error updating tailor order payment:", error);
    return NextResponse.json(
      { message: "Error updating tailor order payment", error: error.message },
      { status: 500 }
    );
  }
}
