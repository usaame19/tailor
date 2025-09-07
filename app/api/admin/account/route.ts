import { NextRequest, NextResponse } from "next/server";
import { accountSchema } from "@/app/validationSchema/account";
import prisma from "@/prisma/client";

export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }


  const body = await request.json();


  const validation = accountSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    // Create the account with its associated atLeast attributes
    const newAccount = await prisma.accounts.create({
      data: {
      account: body.account.toUpperCase(),
      default: body.default || false,
      balance: body.balance,
      cashBalance: body.cashBalance,
      },
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error: any) {
    console.error("Error creating account", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {

  const accounts = await prisma.accounts.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      transactions: true,
    }
  });
  return NextResponse.json(accounts, { status: 200 });
}
