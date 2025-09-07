"use client";
import { DataTable } from "@/components/ui/dataTable";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API } from "@/lib/config";
import Loading from "@/app/loading";
import { motion } from "framer-motion";
import { BsPeople, BsPlusCircle, BsPersonCheck, BsTelephone } from "react-icons/bs";

export default function List() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["customer"],
    queryFn: () => axios.get(`${API}/superAdmin/customer`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return <div className="flex justify-center items-center h-screen text-red-500 font-bold text-xl">Error loading customers.</div>;
  }

  const totalCustomers = data.length;
  const customersWithSizes = data.filter((customer: any) => customer.customerSize?.length > 0).length;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-12"
        >
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Customer Management
            </h1>
            <p className="text-gray-600 mt-2">Manage your customer database and measurements</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard/superAdmin/customer/add">
              <Button className="flex items-center bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-green-300/50 transition-all whitespace-nowrap text-sm sm:text-base">
                <BsPlusCircle className="text-lg sm:text-xl mr-1 sm:mr-2" />
                Add New Customer
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-blue-600">{totalCustomers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BsPeople className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Measurements</p>
                <p className="text-3xl font-bold text-green-600">{customersWithSizes}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BsPersonCheck className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalCustomers > 0 ? Math.round((customersWithSizes / totalCustomers) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BsTelephone className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Customer Directory</h2>
            <p className="text-gray-600 text-sm mt-1">View and manage all your customers</p>
          </div>
          <div className="p-6">
            <DataTable columns={columns} data={data} search={'name'} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
