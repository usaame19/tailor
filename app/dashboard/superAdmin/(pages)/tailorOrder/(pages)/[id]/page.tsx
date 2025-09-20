"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaEdit, FaArrowLeft, FaSave } from "react-icons/fa";
import Link from "next/link";
import Loading from "@/app/loading";
import { toast } from "sonner";

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
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  user: {
    id: string;
    name: string;
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "delivered":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getOrderTypeColor = (orderType: string) => {
  switch (orderType) {
    case "jacket":
      return "bg-blue-100 text-blue-800";
    case "qamis":
      return "bg-green-100 text-green-800";
    case "trouser":
      return "bg-orange-100 text-orange-800";
    case "shirt":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const TailorOrderDetails = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data: tailorOrder, isLoading, error } = useQuery({
    queryKey: ["tailorOrder", orderId],
    queryFn: () => axios.get(`${API}/superAdmin/tailorOrder/${orderId}`).then((res) => res.data),
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => 
      axios.patch(`${API}/superAdmin/tailorOrder/${orderId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tailorOrder", orderId] });
      toast.success("Status updated successfully");
      setIsEditingStatus(false);
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  useEffect(() => {
    if (tailorOrder) {
      setSelectedStatus(tailorOrder.status);
    }
  }, [tailorOrder]);

  const handleStatusChange = () => {
    updateStatusMutation.mutate(selectedStatus);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !tailorOrder) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">Failed to load tailor order details</p>
          <Button onClick={() => router.back()} className="mt-4">
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const order: TailorOrder = tailorOrder;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-gray-600">Created on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/superAdmin/tailorOrder/edit/${order.id}`}>
            <Button variant="outline">
              <FaEdit className="mr-2" />
              Edit Order
            </Button>
          </Link>
          <Link href={`/dashboard/superAdmin/tailorOrder/${order.id}/payment`}>
            <Button variant="default">
              Update Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Order Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order Type</p>
              <Badge className={getOrderTypeColor(order.orderType)}>
                {order.orderType}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              {isEditingStatus ? (
                <div className="flex items-center space-x-2">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleStatusChange}
                    disabled={updateStatusMutation.isPending}
                  >
                    <FaSave className="mr-1" />
                    {updateStatusMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingStatus(false);
                      setSelectedStatus(order.status);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace("_", " ")}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingStatus(true)}
                  >
                    Change Status
                  </Button>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Price</p>
              <p className="text-lg font-semibold">${order.totalPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className={`text-lg font-semibold ${order.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                ${order.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{order.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{order.customer.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created By</p>
              <p className="font-medium">{order.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivery Date</p>
              <p className="font-medium">
                {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-lg font-semibold">${order.paidAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Type</p>
              <p className="font-medium capitalize">{order.paymentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account</p>
              <p className="font-medium">{order.account?.account || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Measurements</CardTitle>
          <CardDescription>
            Custom measurements for this {order.orderType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {order.specifications.map((spec, index) => (
              <div key={spec.id}>
                <h4 className="font-medium mb-3">Measurement Set {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(spec).map(([key, value]) => {
                    if (key === "id" || key === "customMeasurements" || !value) return null;
                    return (
                      <div key={key}>
                        <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="font-medium">{value} inches</p>
                      </div>
                    );
                  })}
                </div>
                {spec.customMeasurements && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Custom Measurements</p>
                    <p className="font-medium">{spec.customMeasurements}</p>
                  </div>
                )}
                {index < order.specifications.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.back()}>
          <FaArrowLeft className="mr-2" />
          Back to Orders
        </Button>
      </div>
    </div>
  );
};

export default TailorOrderDetails;
