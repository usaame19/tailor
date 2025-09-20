"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaEdit, FaTrashAlt, FaEye, FaMoneyBillWave } from "react-icons/fa";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { API } from "@/lib/config";
import { useQueryClient } from "@tanstack/react-query";

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

export const columns: ColumnDef<TailorOrder>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("orderNumber")}</div>
    ),
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.customer.name}</div>
        {row.original.customer.phone && (
          <div className="text-sm text-gray-500">{row.original.customer.phone}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "orderType",
    header: "Type",
    cell: ({ row }) => (
      <Badge className={getOrderTypeColor(row.getValue("orderType"))}>
        {row.getValue("orderType")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={getStatusColor(row.getValue("status") as string)}>
        {(row.getValue("status") as string).replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
    cell: ({ row }) => (
      <div className="font-medium">
        ${(row.getValue("totalPrice") as number)?.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "paidAmount",
    header: "Paid",
    cell: ({ row }) => (
      <div className="font-medium">
        ${(row.getValue("paidAmount") as number)?.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const balance = row.getValue("balance") as number;
      return (
        <div className={`font-medium ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
          ${balance?.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "deliveryDate",
    header: "Delivery",
    cell: ({ row }) => {
      const date = row.getValue("deliveryDate") as string;
      return date ? (
        <div className="text-sm">
          {new Date(date).toLocaleDateString()}
        </div>
      ) : (
        <div className="text-sm text-gray-400">Not set</div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const tailorOrder = row.original;
      const queryClient = useQueryClient();

      const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this tailor order?")) {
          try {
            await axios.delete(`${API}/admin/tailorOrder/${tailorOrder.id}`);
            toast.success("Tailor order deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["tailorOrder"] });
          } catch (error) {
            toast.error("Failed to delete tailor order");
            console.error("Error deleting tailor order:", error);
          }
        }
      };

      return (
        <div className="flex space-x-2">
          <Link href={`/dashboard/admin/tailorOrder/${tailorOrder.id}`}>
            <Button variant="outline" size="sm">
              <FaEye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/admin/tailorOrder/${tailorOrder.id}/edit`}>
            <Button variant="outline" size="sm">
              <FaEdit className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/admin/tailorOrder/${tailorOrder.id}/payment`}>
            <Button variant="outline" size="sm" className="text-green-600">
              <FaMoneyBillWave className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600"
          >
            <FaTrashAlt className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
