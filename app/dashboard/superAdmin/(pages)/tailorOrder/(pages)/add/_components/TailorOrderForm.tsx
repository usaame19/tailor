"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tailorOrderSchema } from "@/app/validationSchema/tailorOrderSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { API } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/app/loading";

interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  customerSize?: Array<{
    id: string;
    neck?: number;
    chest?: number;
    waist?: number;
    hip?: number;
    shoulder?: number;
    sleeve?: number;
    inseam?: number;
    outseam?: number;
    height?: number;
    weight?: number;
    active: boolean;
  }>;
}

interface Account {
  id: string;
  account: string;
  balance: number;
  cashBalance: number;
}

interface TailorSpecification {
  shoulder?: number | null | undefined;
  chest?: number | null | undefined;
  waist?: number | null | undefined;
  length?: number | null | undefined;
  sleeves?: number | null | undefined;
  neck?: number | null | undefined;
  hips?: number | null | undefined;
  thigh?: number | null | undefined;
  bottom?: number | null | undefined;
  customMeasurements?: string | null | undefined;
}

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

const TailorOrderForm = ({ order }: { order?: TailorOrder }) => {
  const router = useRouter();
  const [specifications, setSpecifications] = useState<TailorSpecification[]>([{}]);
  const [selectedOrderType, setSelectedOrderType] = useState<string>("");

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => axios.get(`${API}/superAdmin/customer`).then((res) => res.data),
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
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tailorOrderSchema),
    defaultValues: order
      ? {
          customerId: order.customerId,
          orderType: order.orderType,
          totalPrice: order.totalPrice,
          paidAmount: order.paidAmount,
          paymentType: order.paymentType || "cash",
          accountId: order.accountId || "",
          notes: order.notes || "",
          deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : "",
          specifications: order.specifications.map(spec => ({
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
        }
      : {
          customerId: "",
          orderType: "jacket",
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
  const customerId = watch("customerId");

  // Initialize specifications when in edit mode
  useEffect(() => {
    if (order) {
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
  }, [order, setValue]);

  useEffect(() => {
    setSelectedOrderType(orderType);
    // Only reset specifications when order type changes if not in edit mode
    if (!order) {
      const emptySpecs = [{}];
      setSpecifications(emptySpecs);
      setValue("specifications", emptySpecs);
    }
  }, [orderType, setValue, order]);

  // Auto-populate measurements when customer is selected
  useEffect(() => {
    if (customerId && customers && orderType) {
      const selectedCustomer = customers.find((c: Customer) => c.id === customerId);
      if (selectedCustomer?.customerSize && selectedCustomer.customerSize.length > 0) {
        const activeSize = selectedCustomer.customerSize.find((size: any) => size.active) || selectedCustomer.customerSize[0];
        
        // Map CustomerSize to TailorSpecification based on order type
        const mappedSpec: TailorSpecification = {};
        
        if (orderType === "jacket" || orderType === "qamis" || orderType === "shirt") {
          if (activeSize.shoulder) mappedSpec.shoulder = activeSize.shoulder;
          if (activeSize.chest) mappedSpec.chest = activeSize.chest;
          if (activeSize.waist) mappedSpec.waist = activeSize.waist;
          if (activeSize.neck) mappedSpec.neck = activeSize.neck;
          if (activeSize.sleeve) mappedSpec.sleeves = activeSize.sleeve;
          // Use height as length approximation
          if (activeSize.height) mappedSpec.length = activeSize.height * 0.6; // Rough estimation
        } else if (orderType === "trouser") {
          if (activeSize.waist) mappedSpec.waist = activeSize.waist;
          if (activeSize.hip) mappedSpec.hips = activeSize.hip;
          if (activeSize.inseam) mappedSpec.length = activeSize.inseam;
          if (activeSize.outseam) mappedSpec.thigh = activeSize.outseam * 0.3; // Rough estimation
        }
        
        // Only update if we have meaningful measurements
        if (Object.keys(mappedSpec).length > 0) {
          setSpecifications([mappedSpec]);
          setValue("specifications", [mappedSpec]);
        }
      }
    }
  }, [customerId, customers, orderType]);

  const addSpecification = () => {
    const newSpecs = [...specifications, {}];
    setSpecifications(newSpecs);
    setValue("specifications", newSpecs);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      const newSpecs = specifications.filter((_, i) => i !== index);
      setSpecifications(newSpecs);
      setValue("specifications", newSpecs);
    }
  };

  const updateSpecification = (index: number, field: string, value: number | string) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
    // Also update the form state
    setValue("specifications", updated);
  };

  const onSubmit = async (data: any) => {
    try {
      if (order) {
        // Update existing order
        await axios.patch(`${API}/superAdmin/tailorOrder/${order.id}`, data);
        toast.success("Tailor order updated successfully");
        router.push(`/dashboard/superAdmin/tailorOrder/${order.id}`);
      } else {
        // Create new order
        await axios.post(`${API}/superAdmin/tailorOrder`, data);
        toast.success("Tailor order created successfully");
        router.push("/dashboard/superAdmin/tailorOrder");
      }
    } catch (error: any) {
      toast.error("Failed to save tailor order");
      console.error("Error saving tailor order:", error);
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

  if (customersLoading || accountsLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{order ? `Edit Tailor Order - ${order.orderNumber}` : "Create Tailor Order"}</CardTitle>
          <CardDescription>
            {order ? "Update the tailoring order details" : "Create a new custom tailoring order for a customer"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              <Select 
                value={watch("customerId")} 
                onValueChange={(value) => setValue("customerId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer: Customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{customer.name} {customer.phone && `(${customer.phone})`}</span>
                        {customer.customerSize && customer.customerSize.length > 0 && (
                          <span className="text-xs text-green-600 ml-2">📏</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-sm text-red-500">{errors.customerId.message}</p>
              )}
              {customerId && customers && (() => {
                const selectedCustomer = customers.find((c: Customer) => c.id === customerId);
                return selectedCustomer?.customerSize && selectedCustomer.customerSize.length > 0 ? (
                  <p className="text-sm text-green-600">✓ Measurements will be auto-populated from customer profile</p>
                ) : null;
              })()}
            </div>

            {/* Order Type */}
            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type *</Label>
              <Select 
                value={watch("orderType")} 
                onValueChange={(value) => setValue("orderType", value)}
              >
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
              <Select 
                value={watch("paymentType")} 
                onValueChange={(value) => setValue("paymentType", value)}
              >
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
              <Select 
                value={watch("accountId")} 
                onValueChange={(value) => setValue("accountId", value)}
              >
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
                <div>
                  <Label>Measurements *</Label>
                  <p className="text-sm text-gray-600">At least one measurement is required</p>
                </div>
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
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : order ? "Update Order" : "Create Order"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TailorOrderForm;
