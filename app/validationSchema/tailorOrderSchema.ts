import { z } from "zod";

// Schema for tailor specifications
export const tailorSpecificationSchema = z.object({
  shoulder: z.number().min(0).optional(),
  chest: z.number().min(0).optional(),
  waist: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  sleeves: z.number().min(0).optional(),
  neck: z.number().min(0).optional(),
  hips: z.number().min(0).optional(),
  thigh: z.number().min(0).optional(),
  bottom: z.number().min(0).optional(),
  customMeasurements: z.string().optional(),
});

// Schema for tailor order
export const tailorOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderType: z.enum(["jacket", "qamis", "trouser", "shirt"], {
    required_error: "Order type is required",
  }),
  totalPrice: z.number().min(0, "Total price must be positive"),
  paidAmount: z.number().min(0).default(0),
  paymentType: z.enum(["cash", "digital", "both"]).optional().default("cash"),
  accountId: z.string().optional(),
  specifications: z.array(tailorSpecificationSchema).min(1, "At least one specification is required"),
  notes: z.string().optional(),
  deliveryDate: z.string().optional(), // Will be converted to DateTime in API
});

// Schema for updating tailor order
export const tailorOrderUpdateSchema = z.object({
  orderType: z.enum(["jacket", "qamis", "trouser", "shirt"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "delivered", "cancelled"]).optional(),
  totalPrice: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  paymentType: z.enum(["cash", "digital", "both"]).optional(),
  accountId: z.string().optional(),
  specifications: z.array(tailorSpecificationSchema).optional(),
  notes: z.string().optional(),
  deliveryDate: z.string().optional(),
});

// Schema for payment update
export const tailorOrderPaymentSchema = z.object({
  paidAmount: z.number().min(0, "Paid amount must be positive"),
  paymentType: z.enum(["cash", "digital", "both"]).optional(),
  accountId: z.string().optional(),
});
