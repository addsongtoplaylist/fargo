import { z } from "zod";

// ─── Activity ───────────────────────────────────────────────
export const createActivitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  title: z.string().min(1, "Title is required").max(200),
  time: z.string().optional(),
  notes: z.string().max(1000).optional(),
  category: z.string().default("misc"),
  place_name: z.string().max(300).optional(),
  place_lat: z.string().optional(),
  place_lng: z.string().optional(),
});

export const updateActivitySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  time: z.string().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  category: z.string().optional(),
  cost: z.string().nullable().optional(),
  cost_shared: z.boolean().optional(),
  place_name: z.string().max(300).nullable().optional(),
  place_lat: z.string().nullable().optional(),
  place_lng: z.string().nullable().optional(),
});

// ─── Expense ────────────────────────────────────────────────
export const createExpenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  title: z.string().min(1, "Title is required").max(200),
  category: z.string(),
  amount: z.number().positive("Amount must be positive"),
  fxRate: z.number().positive("FX rate must be positive"),
  paidBy: z.string().uuid(),
  isShared: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateExpenseSchema = createExpenseSchema;

// ─── Trip ───────────────────────────────────────────────────
export const updateTripSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  destination: z.string().min(1).max(200).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  local_currency: z.string().min(1).max(10).optional(),
  fx_rate: z.number().positive().optional(),
  destination_country: z.string().max(100).nullable().optional(),
  destination_country_code: z.string().max(2).nullable().optional(),
  destination_lat: z.number().nullable().optional(),
  destination_lng: z.number().nullable().optional(),
});

// ─── Helpers ────────────────────────────────────────────────
export const uuidSchema = z.string().uuid("Invalid ID");
export const tripIdSchema = uuidSchema;
