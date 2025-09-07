import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "../../../../_components/DeleteAlertDialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpDown, 
  Eye, 
  Edit, 
  User, 
  Phone, 
  Calendar,
  Ruler,
  Trash2
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  customerSize?: {
    id: string;
    neck: number;
    chest: number;
    waist: number;
    hip: number;
    shoulder: number;
    sleeve: number;
    inseam: number;
    outseam: number;
    height: number;
    weight: number;
  }[];
}

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex items-center space-x-2">
        <User className="w-4 h-4 text-primary" />
        <span>Customer Name</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium max-w-[200px] truncate">
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <div className="flex items-center space-x-2">
        <Phone className="w-4 h-4 text-primary" />
        <span>Phone Number</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground font-mono">
        {row.original.phone || "Not provided"}
      </div>
    ),
  },
  {
    id: "measurements",
    header: ({ column }) => (
      <div className="flex items-center space-x-2">
        <Ruler className="w-4 h-4 text-primary" />
        <span>Measurements</span>
      </div>
    ),
    cell: ({ row }) => {
      const hasMeasurements = Array.isArray(row.original.customerSize) && row.original.customerSize.length > 0;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant={hasMeasurements ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer",
                  hasMeasurements 
                    ? "bg-green-100 text-green-800 hover:bg-green-200" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {hasMeasurements ? "Available" : "Missing"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {hasMeasurements 
                  ? `${row.original.customerSize?.length} measurement set(s) available`
                  : "No measurements recorded"
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 hover:text-primary transition-all"
      >
        <Calendar className="w-4 h-4" />
        <span>Created At</span>
        <ArrowUpDown className="w-3 h-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {format(date, "PPP")}
          <div className="text-xs opacity-70">{format(date, "p")}</div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original;
      const router = useRouter();

      return (
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/superAdmin/customer/view/${customer.id}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-primary/10">
              <Eye className="w-4 h-4" />
              <span>View</span>
            </Button>
          </Link>

          <Link href={`/dashboard/superAdmin/customer/edit/${customer.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          </Link>
          
          <DeleteAlertDialog id={customer.id} type="customer" />
        </div>
      );
    },
  },
];
