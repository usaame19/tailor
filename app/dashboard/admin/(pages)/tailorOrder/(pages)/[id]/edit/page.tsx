"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tailorOrderUpdateSchema } from "@/app/validationSchema/tailorOrderSchema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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
  notes?: string;
  deliveryDate?: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  account?: {
    id: string;
    account: string;
  };
  specifications: Array<{
    id: string;
    shoulder?: number;
    chest?: number;
    waist?: number;
    length?: number;
    sleeves?: number;
    neck?: number;
    hips?: number;
    thigh?: number;
    bottom?: number;
    customMeasurements?: string;
  }>;
}

interface Account {
  id: string;
  account: string;
  balance: number;
  cashBalance: number;
}

interface TailorSpecification {
  shoulder?: number;
  chest?: number;
  waist?: number;
  length?: number;
  sleeves?: number;
  neck?: number;
  hips?: number;
  thigh?: number;
  bottom?: number;
  customMeasurements?: string;
}

const EditTailorOrderForm = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [specifications, setSpecifications] = useState<TailorSpecification[]>([]);
  const [selectedOrderType, setSelectedOrderType] = useState<string>("");

  const { data: tailorOrder, isLoading: orderLoading } = useQuery({
    queryKey: ["tailorOrder", orderId],
    queryFn: () => axios.get(`${API}/admin/tailorOrder/${orderId}`).then((res) => res.data),
    enabled: !!orderId,
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => axios.get(`${API}/admin/account`).then((res) => res.data),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tailorOrderUpdateSchema),
    defaultValues: {
      orderType: "jacket",
      status: "pending",
      totalPrice: 0,
      paidAmount: 0,
      paymentType: "cash",
      accountId: "",
      notes: "",
      deliveryDate: "",
      specifications: [{}],
    },
  });

  const orderType = watch("orderType");

  useEffect(() => {
    if (tailorOrder) {
      const order: TailorOrder = tailorOrder;
      setValue("orderType", order.orderType);
      setValue("status", order.status);
      setValue("totalPrice", order.totalPrice);
      setValue("paidAmount", order.paidAmount);
      setValue("paymentType", order.paymentType);
      setValue("accountId", order.account?.id || "");
      setValue("notes", order.notes || "");
      setValue("deliveryDate", order.deliveryDate ? order.deliveryDate.split('T')[0] : "");
      
      setSelectedOrderType(order.orderType);
      const specs = order.specifications.map(spec => ({
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
      }));
      setSpecifications(specs);
      setValue("specifications", specs);
    }
  }, [tailorOrder, setValue]);

  useEffect(() => {
    setSelectedOrderType(orderType);
  }, [orderType]);

  const addSpecification = () => {
    const updated = [...specifications, {}];
    setSpecifications(updated);
    setValue("specifications", updated);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      const updated = specifications.filter((_, i) => i !== index);
      setSpecifications(updated);
      setValue("specifications", updated);
    }
  };

  const updateSpecification = (index: number, field: string, value: number | string) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
    setValue("specifications", updated);
  };

  const onSubmit = async (data: any) => {
    try {
      await axios.patch(`${API}/admin/tailorOrder/${orderId}`, data);
      toast.success("Tailor order updated successfully");
      router.push(`/dashboard/admin/tailorOrder/${orderId}`);
    } catch (error: any) {
      toast.error("Failed to update tailor order");
      console.error("Error updating tailor order:", error);
    }
  };

  const getMeasurementFields = (orderType: string) => {
    switch (orderType) {
      case "jacket":
      case "qamis":
      case "shirt":
        return [
          { key: "shoulder", label: "Shoulder (inches)" },
          { key: "chest", label: "Chest (inches)" },
          { key: "waist", label: "Waist (inches)" },
          { key: "length", label: "Length (inches)" },
          { key: "sleeves", label: "Sleeves (inches)" },
          { key: "neck", label: "Neck (inches)" },
        ];
      case "trouser":
        return [
          { key: "waist", label: "Waist (inches)" },
          { key: "hips", label: "Hips (inches)" },
          { key: "thigh", label: "Thigh (inches)" },
          { key: "length", label: "Length (inches)" },
          { key: "bottom", label: "Bottom (inches)" },
        ];
      default:
        return [];
    }
  };

  if (orderLoading || accountsLoading) {
    return <Loading />;
  }

  if (!tailorOrder) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">Failed to load tailor order</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const order: TailorOrder = tailorOrder;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Tailor Order - {order.orderNumber}</CardTitle>
          <CardDescription>
            Update the details of this tailoring order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Order Type */}
            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type *</Label>
              <Select onValueChange={(value) => setValue("orderType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jacket">Jacket</SelectItem>
                  <SelectItem value="qamis">Qamis</SelectItem>
                  <SelectItem value="trouser">Trouser</SelectItem>
                  <SelectItem value="shirt">Shirt</SelectItem>
                </SelectContent>
              </Select>
              {errors.orderType && (
                <p className="text-sm text-red-500">{errors.orderType.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalPrice">Total Price *</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  {...register("totalPrice", { valueAsNumber: true })}
                />
                {errors.totalPrice && (
                  <p className="text-sm text-red-500">{errors.totalPrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidAmount">Paid Amount</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  step="0.01"
                  {...register("paidAmount", { valueAsNumber: true })}
                />
                {errors.paidAmount && (
                  <p className="text-sm text-red-500">{errors.paidAmount.message}</p>
                )}
              </div>
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

            {/* Specifications */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Measurements</Label>
                <Button type="button" onClick={addSpecification} variant="outline">
                  Add Measurement Set
                </Button>
              </div>
              
              {specifications.map((spec, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Measurement Set {index + 1}</CardTitle>
                      {specifications.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getMeasurementFields(selectedOrderType).map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={`${field.key}-${index}`}>{field.label}</Label>
                          <Input
                            id={`${field.key}-${index}`}
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            value={spec[field.key as keyof TailorSpecification] || ""}
                            onChange={(e) =>
                              updateSpecification(index, field.key, parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`custom-${index}`}>Custom Measurements</Label>
                      <Textarea
                        id={`custom-${index}`}
                        placeholder="Any additional measurements or notes..."
                        value={spec.customMeasurements || ""}
                        onChange={(e) =>
                          updateSpecification(index, "customMeasurements", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                {...register("deliveryDate")}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or special instructions..."
                {...register("notes")}
              />
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
                {isSubmitting ? "Updating..." : "Update Order"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTailorOrderForm;
