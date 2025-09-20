"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Phone, 
  Ruler, 
  Save, 
  ArrowLeft,
  UserPlus,
  Users,
  UserCheck
} from "lucide-react";
import Loading from "@/app/loading";
import { toast } from "sonner";
import { API } from "@/lib/config";
import axios from "axios";

const initialCustomer = { name: "", phone: "" };
const initialSize = {
  neck: "", chest: "", waist: "", hip: "", shoulder: "", sleeve: "", inseam: "", outseam: "", height: "", weight: ""
};

const measurementFields = [
  { key: 'neck', label: 'Neck', unit: 'inches', icon: '👔', description: 'Around the base of the neck' },
  { key: 'chest', label: 'Chest', unit: 'inches', icon: '👕', description: 'Around the fullest part of the chest' },
  { key: 'waist', label: 'Waist', unit: 'inches', icon: '👖', description: 'Around the natural waistline' },
  { key: 'hip', label: 'Hip', unit: 'inches', icon: '🩳', description: 'Around the fullest part of the hips' },
  { key: 'shoulder', label: 'Shoulder', unit: 'inches', icon: '👔', description: 'Across the shoulders from point to point' },
  { key: 'sleeve', label: 'Sleeve', unit: 'inches', icon: '👕', description: 'From shoulder to wrist' },
  { key: 'inseam', label: 'Inseam', unit: 'inches', icon: '👖', description: 'Inside leg from crotch to ankle' },
  { key: 'outseam', label: 'Outseam', unit: 'inches', icon: '👖', description: 'Outside leg from waist to ankle' },
  { key: 'height', label: 'Height', unit: 'inches', icon: '📏', description: 'Total height' },
  { key: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️', description: 'Body weight' },
];

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export default function AddCustomerSizeForm() {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [customer, setCustomer] = useState(initialCustomer);
  const [size, setSize] = useState(initialSize);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    axios.get(`${API}/superAdmin/customer`)
      .then(res => {
        setCustomers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Failed to load customers");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (mode === "new") {
        const response = await axios.post(`${API}/superAdmin/customer`, { customer, size });
        if (response.status === 200) {
          toast.success("New customer and measurements added successfully!");
        }
      } else {
        if (!selectedCustomerId) {
          toast.error("Please select a customer");
          setSaving(false);
          return;
        }
        const response = await axios.post(`${API}/superAdmin/customer/${selectedCustomerId}/size`, { size });
        if (response.status === 200) {
          toast.success("Measurements added to existing customer successfully!");
        }
      }
      router.push("/dashboard/superAdmin/customer");
    } catch (error) {
      toast.error("Failed to save customer data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

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
                Add Customer
              </h1>
              <p className="text-gray-600">Add new customer or measurements to existing customer</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Mode Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Customer Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={mode} onValueChange={(value) => setMode(value as "existing" | "new")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing" className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Existing Customer
                    </TabsTrigger>
                    <TabsTrigger value="new" className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      New Customer
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="customer-select" className="flex items-center text-sm font-medium">
                        <Users className="w-4 h-4 mr-2" />
                        Select Customer
                      </Label>
                      <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} required>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Choose an existing customer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name} {c.phone && `(${c.phone})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Select a customer to add measurements to their profile
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="new" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center text-sm font-medium">
                          <User className="w-4 h-4 mr-2" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={customer.name}
                          onChange={e => setCustomer({ ...customer, name: e.target.value })}
                          placeholder="Enter customer's full name"
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center text-sm font-medium">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customer.phone}
                          onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                          placeholder="Enter phone number"
                          className="h-11"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Measurements Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Ruler className="w-5 h-5 mr-2" />
                  Body Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {measurementFields.map((field, index) => (
                    <motion.div
                      key={field.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + (index * 0.05) }}
                      className="space-y-2"
                    >
                      <Label 
                        htmlFor={field.key} 
                        className="flex items-center text-sm font-medium text-gray-700"
                      >
                        <span className="mr-2">{field.icon}</span>
                        {field.label} ({field.unit})
                      </Label>
                      <Input
                        id={field.key}
                        type="number"
                        step="0.1"
                        value={size[field.key as keyof typeof size] ?? ""}
                        onChange={e => setSize({ ...size, [field.key]: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">{field.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end space-x-4"
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="px-8"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="px-8 bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Customer
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
