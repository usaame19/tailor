import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get customer by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: { customerSize: true }
    });
    
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    
    return NextResponse.json(customer);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Update customer and size
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { customer, size } = await req.json();
    
    // Update customer basic info
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: customer.name,
        phone: customer.phone || null
      }
    });

    // Update or create customer size
    if (size) {
      // Convert string values to numbers for size measurements
      const processedSize = Object.fromEntries(
        Object.entries(size).map(([key, value]) => [
          key, 
          value === "" || value === null || value === undefined ? null : Number(value)
        ])
      );

      const existingSize = await prisma.customerSize.findFirst({
        where: { customerId: params.id }
      });

      if (existingSize) {
        await prisma.customerSize.update({
          where: { id: existingSize.id },
          data: processedSize
        });
      } else {
        await prisma.customerSize.create({
          data: {
            customerId: params.id,
            ...processedSize
          }
        });
      }
    }

    // Return updated customer with size
    const result = await prisma.customer.findUnique({
      where: { id: params.id },
      include: { customerSize: true }
    });

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("Error updating customer:", e);
    return NextResponse.json({ 
      error: e.message,
      details: e 
    }, { status: 500 });
  }
}

// Delete customer
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // First delete customer sizes
    await prisma.customerSize.deleteMany({
      where: { customerId: params.id }
    });

    // Then delete customer
    await prisma.customer.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
