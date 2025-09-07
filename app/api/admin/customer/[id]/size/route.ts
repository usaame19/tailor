import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add size for existing customer
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { size } = await req.json();
    
    // Convert string values to numbers for size measurements
    const processedSize = Object.fromEntries(
      Object.entries(size).map(([key, value]) => [
        key, 
        value === "" || value === null || value === undefined ? null : Number(value)
      ])
    );

    const created = await prisma.customerSize.create({
      data: {
        ...processedSize,
        customerId: params.id
      }
    });
    return NextResponse.json(created);
  } catch (e: any) {
    console.error("Error creating customer size:", e);
    return NextResponse.json({ 
      error: e.message,
      details: e 
    }, { status: 500 });
  }
}
