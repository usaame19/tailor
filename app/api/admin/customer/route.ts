import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: { customerSize: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(customers);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Create new customer with size
export async function POST(req: NextRequest) {
  try {
    const { customer, size } = await req.json();
    
    if (!customer?.name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    // Convert string values to numbers for size measurements
    const processedSize = size ? Object.fromEntries(
      Object.entries(size).map(([key, value]) => [
        key, 
        value === "" || value === null || value === undefined ? null : Number(value)
      ])
    ) : {};

    const created = await prisma.customer.create({
      data: {
        name: customer.name,
        phone: customer.phone || null,
        customerSize: {
          create: processedSize
        }
      },
      include: { customerSize: true }
    });
    
    return NextResponse.json(created);
  } catch (e: any) {
    console.error("Error creating customer:", e);
    return NextResponse.json({ 
      error: e.message,
      details: e 
    }, { status: 500 });
  }
}
