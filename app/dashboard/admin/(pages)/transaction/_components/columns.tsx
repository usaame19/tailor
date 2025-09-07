import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "../../../../_components/DeleteAlertDialog";

interface Transaction {
  id: string;
  no: number;
  user: {
    name: string;
  };
  account: {
    account: string;
  };
  amount: number;
  acc: string;
  type: string;
  tranDate: string;
  details: string;
  amountType: string;
  category: {
    name: string;
  };
  createdAt: string;
  isExchange?: boolean; // For exchange transactions
  exchangeType?: string; // For exchangeType transactions
  senderName?: string; // For exchange - sender's name (if withdrawal)
  receiverName?: string; // For exchange - receiver's name (if deposit)
  senderPhone?: string; // For exchange - sender's name (if withdrawal)
  receiverPhone?: string; // For exchange - receiver's name (if deposit)
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "no",
    header: "NO",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "details",
    header: "Transaction Details",
    cell: ({ row }) => {
      if (!row.original.details) {
        return <span className="text-center">-</span>; // Dash for exchange transactions
      } else {
        return <span >{row.original.details}</span>;
      }

    },
  },
  {
    accessorKey: "category.name",
    header: "Category",
  },
  {
    accessorKey: "account.account",
    header: "Amount",
    cell: ({ row }) => {
      const amountType = row.original.account.account;
      const formattedAmount =
        amountType === "USD"
          ? `$${row.original.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : row.original.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return <span>{formattedAmount}</span>; // Format amount
    },
  },
  {
    accessorKey: "account.account",
    header: "Account",
    cell: ({ row }) => {
      return <span>{row.original.account.account}</span>;
    },
  },
  {
    accessorKey: "acc",
    header: "In/Out",
    cell: ({ row }) => {
      if (row.original.isExchange) {
        return <span>-</span>; // Dash for exchange transactions
      }
      const accType = row.original.acc;
      const color = accType === "Dr" ? "text-red-500" : "text-green-500";
      const displayText = accType === "Dr" ? "OUT" : "IN";
      return <span className={color}>{displayText}</span>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      if (row.original.isExchange) {
        return <span>-</span>; // Dash for exchange transactions
      }

      // Conditional logic for displaying type
      const type = row.original.type;
      const amountType = row.original.amountType;

      if (type === "cash") {
        return <span>Cash</span>;
      } else if (type === "digital") {
        if (amountType === "KES") {
          return <span>mPesa</span>; // KES amount type should display mPesa
        } else if (amountType === "USD") {
          return <span>EVC</span>; // USD amount type should display EVC
        }
      }
      return <span>-</span>;
    },
  },
  {
    accessorKey: "exchangeDetails",
    header: "Exchange Info",
    cell: ({ row }) => {
      if (row.original.isExchange) {
        const isWithdrawal = row.original.exchangeType === "withdrawal";
        const personName = isWithdrawal
          ? row.original.senderName || "Sender not provided"
          : row.original.receiverName || "Receiver not provided";
        const personPhone = isWithdrawal
          ? row.original.senderPhone || "-"
          : row.original.receiverPhone || "-";

        // Apply distinct colors for withdrawal and deposit
        const exchangeTypeColor = isWithdrawal ? "text-red-500" : "text-green-500";
        const exchangeTypeText = isWithdrawal ? "Withdrawal" : "Deposit";

        return (
          <div>
            <span className={exchangeTypeColor}>
              {exchangeTypeText}:
            </span>{" "}
            {personName} ({personPhone})
          </div>
        );
      }
      return <span>-</span>; // If it's not an exchange transaction, display a dash
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return format(date, "PPpp"); // Format date to include full date and time
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const transaction = row.original;

      const HOURS_48_IN_MILLISECONDS = 48 * 60 * 60 * 1000;

      function isWithin48Hours(date: Date): boolean {
        const currentTime = new Date().getTime();
        const createdTime = new Date(date).getTime();
        return currentTime - createdTime <= HOURS_48_IN_MILLISECONDS;
      }

      const within48Hours = isWithin48Hours(new Date(transaction.createdAt));

      return (
        <div className="flex items-center space-x-2">
          {/* View Button */}
          <Link href={`/dashboard/admin/transaction/view/${transaction.id}`}>
            <button className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100">
              View
            </button>
          </Link>

          {/* Edit Button */}
          <div
            className={`${within48Hours ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            title={
              within48Hours
                ? "Edit this transaction"
                : "Editing disabled for transactions older than 48 hours"
            }
          >
            {within48Hours ? (
              <Link href={`/dashboard/admin/transaction/edit/${transaction.id}`}>
                <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Edit
                </button>
              </Link>
            ) : (
              <button className="px-3 py-1 bg-yellow-500 text-white rounded">
                Edit
              </button>
            )}
          </div>

          {/* Delete Button */}
          <div
            className={`${within48Hours ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            title={
              within48Hours
                ? "Delete this transaction"
                : "Deleting disabled for transactions older than 48 hours"
            }
          >
            {within48Hours ? (
              <DeleteAlertDialog id={transaction.id} type="transaction" />
            ) : (
              <button className="px-3 py-1 bg-red-500 text-white rounded">
                Delete
              </button>
            )}
          </div>
        </div>
      );
    },
  }

];


