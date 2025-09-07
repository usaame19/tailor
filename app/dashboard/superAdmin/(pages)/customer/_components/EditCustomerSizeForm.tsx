"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Phone, 
  Ruler, 
  Save, 
  ArrowLeft,
  UserCog
} from "lucide-react";
import Loading from "@/app/loading";
import { toast } from "sonner";

const initialCustomer = { name: "", phone: "" };
const initialSize = {
  neck: "", chest: "", waist: "", hip: "", shoulder: "", sleeve: "", inseam: "", outseam: "", height: "", weight: ""
};

const measurementFields = [
  { key: 'neck', label: 'Neck', unit: 'cm', icon: '👔', description: 'Around the base of the neck' },
  { key: 'chest', label: 'Chest', unit: 'cm', icon: '👕', description: 'Around the fullest part of the chest' },
  { key: 'waist', label: 'Waist', unit: 'cm', icon: '👖', description: 'Around the natural waistline' },
  { key: 'hip', label: 'Hip', unit: 'cm', icon: '🩳', description: 'Around the fullest part of the hips' },
  { key: 'shoulder', label: 'Shoulder', unit: 'cm', icon: '👔', description: 'Across the shoulders from point to point' },
  { key: 'sleeve', label: 'Sleeve', unit: 'cm', icon: '👕', description: 'From shoulder to wrist' },
  { key: 'inseam', label: 'Inseam', unit: 'cm', icon: '👖', description: 'Inside leg from crotch to ankle' },
  { key: 'outseam', label: 'Outseam', unit: 'cm', icon: '👖', description: 'Outside leg from waist to ankle' },
  { key: 'height', label: 'Height', unit: 'cm', icon: '📏', description: 'Total height' },
  { key: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️', description: 'Body weight' },
];

export default function EditCustomerSizeForm() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [customer, setCustomer] = useState(initialCustomer);
  const [size, setSize] = useState(initialSize);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/superAdmin/customer/${id}`)
      .then(res => res.json())
      .then(data => {
        setCustomer({ name: data.name, phone: data.phone });
        if (data.customerSize?.length) {
          setSize({ ...data.customerSize[0] });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Failed to load customer data");
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`/api/superAdmin/customer/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, size })
      });

      if (response.ok) {
        toast.success("Customer updated successfully!");
        router.push("/dashboard/superAdmin/customer");
      } else {
        toast.error("Failed to update customer");
      }
    } catch (error) {
      toast.error("An error occurred while updating the customer");
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
                Edit Customer
              </h1>
              <p className="text-gray-600">Update customer information and measurements</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <UserCog className="w-5 h-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
              className="px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
