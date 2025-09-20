import React from "react";
import prisma from "@/prisma/client";
import TailorOrderForm from "../../(pages)/add/_components/TailorOrderForm";

interface TailorOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  userId: string;
  orderType: string;
  status: string;
  totalPrice: number;
  paidAmount: number;
  balance: number;
  paymentType: string | null;
  accountId?: string | null;
  notes?: string | null;
  deliveryDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
  };
  user: {
    id: string;
    name: string | null;
  };
  account?: {
    id: string;
    account: string;
  } | null;
  specifications: Array<{
    id: string;
    shoulder?: number | null;
    chest?: number | null;
    waist?: number | null;
    length?: number | null;
    sleeves?: number | null;
    neck?: number | null;
    hips?: number | null;
    thigh?: number | null;
    bottom?: number | null;
    customMeasurements?: string | null;
  }>;
}

const EditTailorOrderPage = async ({ params }: { params: { id: string } }) => {
  let order: TailorOrder | null = null;

  try {
    order = await prisma.tailorOrder.findUnique({
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
  } catch (err) {
    console.error("Error fetching tailor order:", err);
    order = null;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">Tailor order not found</p>
        </div>
      </div>
    );
  }

  return <TailorOrderForm order={order as any} />;
};

export default EditTailorOrderPage;
