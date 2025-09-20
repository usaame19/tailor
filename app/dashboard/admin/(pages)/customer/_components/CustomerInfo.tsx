"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Phone, 
  Ruler, 
  Calendar, 
  Edit, 
  ArrowLeft,
  UserCheck,
  UserX,
  Weight,
  History,
  ChevronDown,
  ChevronUp,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import Loading from "@/app/loading";
import Link from "next/link";

interface CustomerSize {
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
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  customerSize?: CustomerSize[];
}

export default function CustomerInfo() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllMeasurements, setShowAllMeasurements] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/customer/${id}`)
      .then(res => res.json())
      .then(data => {
        setCustomer(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Loading />;
  if (!customer) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <UserX className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-600 mb-2">Customer Not Found</h2>
      <p className="text-gray-500 mb-4">The customer you're looking for doesn't exist.</p>
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Go Back
      </Button>
    </div>
  );

  const latestSize = customer.customerSize?.[0];
  const hasMeasurements = customer.customerSize && customer.customerSize.length > 0;
  const allMeasurements = customer.customerSize || [];
  const sortedMeasurements = [...allMeasurements].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const measurementFields = [
    { key: 'neck', label: 'Neck', unit: 'inches', icon: '👔' },
    { key: 'chest', label: 'Chest', unit: 'inches', icon: '👕' },
    { key: 'waist', label: 'Waist', unit: 'inches', icon: '👖' },
    { key: 'hip', label: 'Hip', unit: 'inches', icon: '🩳' },
    { key: 'shoulder', label: 'Shoulder', unit: 'inches', icon: '👔' },
    { key: 'sleeve', label: 'Sleeve', unit: 'inches', icon: '👕' },
    { key: 'inseam', label: 'Inseam', unit: 'inches', icon: '👖' },
    { key: 'outseam', label: 'Outseam', unit: 'inches', icon: '👖' },
    { key: 'height', label: 'Height', unit: 'inches', icon: '📏' },
    { key: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️' },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Customer Details
              </h1>
              <p className="text-gray-600">View customer information and measurements</p>
            </div>
          </div>
          <Link href={`/dashboard/admin/customer/edit/${customer.id}`}>
            <Button className="flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <Edit className="w-4 h-4 mr-2" />
              Edit Customer
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="text-lg font-semibold text-gray-800">{customer.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {customer.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {format(new Date(customer.createdAt), "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-amber-100 rounded-full">
                      {hasMeasurements ? (
                        <UserCheck className="w-6 h-6 text-amber-600" />
                      ) : (
                        <UserX className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Measurements Status</p>
                      <Badge 
                        variant={hasMeasurements ? "default" : "secondary"}
                        className={hasMeasurements ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                      >
                        {hasMeasurements ? "Available" : "Missing"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Measurements Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Ruler className="w-5 h-5 mr-2" />
                    Body Measurements
                  </CardTitle>
                  {hasMeasurements && allMeasurements.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllMeasurements(!showAllMeasurements)}
                      className="text-white hover:bg-white/20"
                    >
                      {showAllMeasurements ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Show Latest Only
                        </>
                      ) : (
                        <>
                          <History className="w-4 h-4 mr-1" />
                          Show All ({allMeasurements.length})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {hasMeasurements ? (
                  <div className="space-y-6">
                    {/* Latest Measurements Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          {showAllMeasurements ? 'All measurement records' : `Latest recorded on ${format(new Date(latestSize!.createdAt), "PPP")}`}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {allMeasurements.length} set{allMeasurements.length > 1 ? 's' : ''} available
                      </Badge>
                    </div>

                    {/* Measurements Display */}
                    {showAllMeasurements ? (
                      /* Show All Measurements */
                      <div className="space-y-8">
                        {sortedMeasurements.map((measurement, index) => (
                          <motion.div
                            key={measurement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                <h4 className="font-semibold text-gray-800">
                                  {index === 0 ? 'Latest' : `Record ${index + 1}`}
                                </h4>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  {format(new Date(measurement.createdAt), "PPP")}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(measurement.createdAt), "p")}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              {measurementFields.map((field) => {
                                const value = measurement[field.key as keyof CustomerSize] as number;
                                return (
                                  <div
                                    key={field.key}
                                    className="bg-white p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-lg">{field.icon}</span>
                                      <span className="text-xs text-gray-500 uppercase">
                                        {field.unit}
                                      </span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-600 mb-1">
                                      {field.label}
                                    </p>
                                    <p className="text-lg font-bold text-gray-800">
                                      {value ? `${value}` : "—"}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      /* Show Latest Measurements Only */
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {measurementFields.map((field) => {
                          const value = latestSize![field.key as keyof CustomerSize] as number;
                          return (
                            <motion.div
                              key={field.key}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + (measurementFields.indexOf(field) * 0.05) }}
                              className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{field.icon}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                  {field.unit}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-600 mb-1">
                                {field.label}
                              </p>
                              <p className="text-xl font-bold text-gray-800">
                                {value ? `${value}` : "—"}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        {allMeasurements.length > 1 && !showAllMeasurements && (
                          <p>This customer has {allMeasurements.length} measurement records</p>
                        )}
                      </div>
                      <Link href={`/dashboard/admin/customer/edit/${customer.id}`}>
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                          <Edit className="w-4 h-4 mr-2" />
                          Update Measurements
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Measurements Available</h3>
                    <p className="text-gray-500 mb-6">
                      This customer doesn't have any body measurements recorded yet.
                    </p>
                    <Link href={`/dashboard/admin/customer/edit/${customer.id}`}>
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                        Add Measurements
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
