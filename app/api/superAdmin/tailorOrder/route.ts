import { NextRequest, NextResponse } from "next/server";
import { tailorOrderSchema } from "@/app/validationSchema/tailorOrderSchema";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import AuthOptions from "@/app/api/auth/[...nextauth]/AuthOptions";
import { User } from "@prisma/client";

// Generate unique order number
async function generateOrderNumber(): Promise<string> {
  const count = await prisma.tailorOrder.count();
  const orderNumber = `TO-${String(count + 1).padStart(4, '0')}`;
  return orderNumber;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }

  const session = await getServerSession(AuthOptions);
  const userId = (session?.user as User).id;
  
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const validation = tailorOrderSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: body.customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
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

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Calculate balance
    const balance = body.totalPrice - body.paidAmount;

    // Create tailor order with specifications
    const newTailorOrder = await prisma.tailorOrder.create({
      data: {
        orderNumber,
        customerId: body.customerId,
        userId: userId, // Use authenticated user ID
        orderType: body.orderType,
        totalPrice: body.totalPrice,
        paidAmount: body.paidAmount,
        balance,
        paymentType: body.paymentType,
        accountId: body.accountId,
        notes: body.notes,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        specifications: {
          create: body.specifications.map((spec: any) => ({
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
        },
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

    return NextResponse.json(newTailorOrder, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tailor order:", error);
    return NextResponse.json(
      { message: "Error creating tailor order", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderType = searchParams.get("orderType");
    const customerId = searchParams.get("customerId");

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (orderType) where.orderType = orderType;
    if (customerId) where.customerId = customerId;

    const tailorOrders = await prisma.tailorOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(tailorOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching tailor orders:", error);
    return NextResponse.json(
      { message: "Error fetching tailor orders" },
      { status: 500 }
    );
  }
}
