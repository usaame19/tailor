"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tailorOrderPaymentSchema } from "@/app/validationSchema/tailorOrderSchema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FaArrowLeft } from "react-icons/fa";
import Loading from "@/app/loading";

interface TailorOrder {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  totalPrice: number;
  paidAmount: number;
  balance: number;
  paymentType: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  account?: {
    id: string;
    account: string;
  };
}

interface Account {
  id: string;
  account: string;
  balance: number;
  cashBalance: number;
}

const PaymentUpdateForm = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: tailorOrder, isLoading: orderLoading } = useQuery({
    queryKey: ["tailorOrder", orderId],
    queryFn: () => axios.get(`${API}/superAdmin/tailorOrder/${orderId}`).then((res) => res.data),
    enabled: !!orderId,
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => axios.get(`${API}/superAdmin/account`).then((res) => res.data),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tailorOrderPaymentSchema),
    defaultValues: {
      paidAmount: 0,
      paymentType: "cash",
      accountId: "",
    },
  });

  useEffect(() => {
    if (tailorOrder) {
      setValue("paidAmount", tailorOrder.paidAmount);
      setValue("paymentType", tailorOrder.paymentType);
      setValue("accountId", tailorOrder.account?.id || "");
    }
  }, [tailorOrder, setValue]);

  const onSubmit = async (data: any) => {
    try {
      await axios.patch(`${API}/superAdmin/tailorOrder/${orderId}/payment`, data);
      toast.success("Payment updated successfully");
      router.push(`/dashboard/superAdmin/tailorOrder/${orderId}`);
    } catch (error: any) {
      toast.error("Failed to update payment");
      console.error("Error updating payment:", error);
    }
  };

  if (orderLoading || accountsLoading) {
    return <Loading />;
  }

  if (!tailorOrder) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">Failed to load tailor order</p>
          <Button onClick={() => router.back()} className="mt-4">
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const order: TailorOrder = tailorOrder;
  const paidAmount = watch("paidAmount");
  const newBalance = order.totalPrice - paidAmount;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Payment</CardTitle>
          <CardDescription>
            Update payment information for Order {order.orderNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Customer</p>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Type</p>
                <p className="font-medium capitalize">{order.orderType}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Price</p>
                <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Current Balance</p>
                <p className={`font-medium ${order.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                  ${order.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Paid Amount */}
            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid Amount *</Label>
              <Input
                id="paidAmount"
                type="number"
                step="0.01"
                max={order.totalPrice}
                {...register("paidAmount", { valueAsNumber: true })}
              />
              {errors.paidAmount && (
                <p className="text-sm text-red-500">{errors.paidAmount.message}</p>
              )}
              <p className="text-sm text-gray-600">
                Maximum: ${order.totalPrice.toFixed(2)}
              </p>
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select onValueChange={(value) => setValue("paymentType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Selection */}
            <div className="space-y-2">
              <Label htmlFor="accountId">Account</Label>
              <Select onValueChange={(value) => setValue("accountId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account: Account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account} - ${account.balance.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* New Balance Preview */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Payment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">New Paid Amount</p>
                  <p className="font-medium">${paidAmount?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-gray-600">New Balance</p>
                  <p className={`font-medium ${newBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                    ${newBalance?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentUpdateForm;
