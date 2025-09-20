"use client";
import { DataTable } from "@/components/ui/dataTable";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API } from "@/lib/config";
import Loading from "@/app/loading";

export default function TailorOrderList() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["tailorOrder"],
    queryFn: () => axios.get(`${API}/admin/tailorOrder`).then((res) => res.data),
    staleTime: 0,
    retry: 3,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return <div>Error loading tailor orders.</div>;
  }

  return (
    <div className="my-4 space-y-4 sm:p-6 lg:p-2">
      <div className="flex justify-between">
        <h1 className="font-bold text-2xl">Tailor Orders</h1>
        <Link href={"/dashboard/admin/tailorOrder/add"}>
          <Button variant={"default"}>
            Create Order
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} search={'orderNumber'} />
    </div>
  );
}
