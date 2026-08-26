"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { revalidatePath } from "next/cache";
import { createExpenseSchema, updateExpenseSchema, tripIdSchema, uuidSchema } from "@/lib/validations";

export type Expense = {
  id: string;
  trip_id: string;
  date: string;
  title: string;
  category: string;
  amount: string;
  amount_myr: string;
  paid_by: string;
  is_shared: boolean;
  activity_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getExpenses(tripId: string): Promise<Expense[]> {
  const account = await getOrCreateAccount();
  if (!account) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return (data as Expense[]) ?? [];
}

export async function createExpense(
  tripId: string,
  fields: {
    date: string;
    title: string;
    category: string;
    amount: number;
    fxRate: number;
    paidBy: string;
    isShared?: boolean;
    notes?: string;
  }
) {
  tripIdSchema.parse(tripId);
  const validated = createExpenseSchema.parse(fields);

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const amountMyr = validated.amount / validated.fxRate;

  const { error } = await supabase.from("expenses").insert({
    trip_id: tripId,
    date: validated.date,
    title: validated.title,
    category: validated.category,
    amount: validated.amount,
    amount_myr: Math.round(amountMyr * 100) / 100,
    paid_by: validated.paidBy,
    is_shared: validated.isShared ?? false,
    notes: validated.notes || null,
  });

  if (error) {
    console.error("Failed to create expense:", error);
    throw new Error("Failed to create expense");
  }

  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

export async function updateExpense(
  expenseId: string,
  tripId: string,
  fields: {
    date: string;
    title: string;
    category: string;
    amount: number;
    fxRate: number;
    paidBy: string;
    isShared?: boolean;
    notes?: string;
  }
) {
  uuidSchema.parse(expenseId);
  tripIdSchema.parse(tripId);
  const validated = updateExpenseSchema.parse(fields);

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const amountMyr = validated.amount / validated.fxRate;

  const { error } = await supabase
    .from("expenses")
    .update({
      date: validated.date,
      title: validated.title,
      category: validated.category,
      amount: validated.amount,
      amount_myr: Math.round(amountMyr * 100) / 100,
      paid_by: validated.paidBy,
      is_shared: validated.isShared ?? false,
      notes: validated.notes || null,
    })
    .eq("id", expenseId)
    .eq("trip_id", tripId);

  if (error) {
    console.error("Failed to update expense:", error);
    throw new Error("Failed to update expense");
  }

  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

export async function deleteExpense(expenseId: string, tripId: string) {
  uuidSchema.parse(expenseId);
  tripIdSchema.parse(tripId);

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("trip_id", tripId);

  if (error) {
    console.error("Failed to delete expense:", error);
    throw new Error("Failed to delete expense");
  }

  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

/** Get the total spent (in MYR) for a trip, splitting shared expenses equally */
export async function getTripSpending(tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) return { total: 0, byDate: {} as Record<string, number>, byCategory: {} as Record<string, number> };

  const supabase = await createClient();
  const [{ data: expenses }, { count: travellerCount }] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount_myr, date, category, is_shared")
      .eq("trip_id", tripId),
    supabase
      .from("travellers")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", tripId),
  ]);

  if (!expenses) return { total: 0, byDate: {} as Record<string, number>, byCategory: {} as Record<string, number> };

  const splitBy = travellerCount && travellerCount > 1 ? travellerCount : 1;

  let total = 0;
  const byDate: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const e of expenses) {
    const myr = parseFloat(e.amount_myr);
    // Shared expenses: your share = total ÷ number of travellers
    const myShare = e.is_shared ? myr / splitBy : myr;
    total += myShare;
    byDate[e.date] = (byDate[e.date] || 0) + myShare;
    byCategory[e.category] = (byCategory[e.category] || 0) + myShare;
  }

  return { total: Math.round(total * 100) / 100, byDate, byCategory };
}

/** Update the planner's budget total */
export async function updateBudget(tripId: string, budgetTotal: number) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // Find the planner's traveller record
  const { data: traveller } = await supabase
    .from("travellers")
    .select("id")
    .eq("trip_id", tripId)
    .eq("account_id", account.id)
    .single();

  if (!traveller) throw new Error("Not a traveller on this trip");

  const { error } = await supabase
    .from("travellers")
    .update({ budget_total: budgetTotal })
    .eq("id", traveller.id);

  if (error) {
    console.error("Failed to update budget:", error);
    throw new Error("Failed to update budget");
  }

  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

/** Get the planner's budget and computed daily free budget */
export async function getBudgetSummary(tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) return null;

  const supabase = await createClient();

  // Parallel fetch: traveller, trip, expenses, activity costs, and traveller count
  const [
    { data: traveller },
    { data: trip },
    { data: expenses },
    { data: activities },
    { count: travellerCount },
  ] = await Promise.all([
    supabase
      .from("travellers")
      .select("id, budget_total")
      .eq("trip_id", tripId)
      .eq("account_id", account.id)
      .single(),
    supabase
      .from("trips")
      .select("start_date, end_date, fx_rate")
      .eq("id", tripId)
      .single(),
    supabase
      .from("expenses")
      .select("amount_myr, date, category, is_shared")
      .eq("trip_id", tripId),
    supabase
      .from("activities")
      .select("cost, cost_shared")
      .eq("trip_id", tripId)
      .not("cost", "is", null),
    supabase
      .from("travellers")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", tripId),
  ]);

  if (!traveller || !trip) return null;

  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const tripDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const fxRate = parseFloat(trip.fx_rate) || 1;
  const splitBy = travellerCount && travellerCount > 1 ? travellerCount : 1;

  // Compute spending totals — shared expenses split equally among travellers
  let totalSpent = 0;
  const spendingByDate: Record<string, number> = {};
  const spendingByCategory: Record<string, number> = {};

  if (expenses) {
    for (const e of expenses) {
      const myr = parseFloat(e.amount_myr);
      const myShare = e.is_shared ? myr / splitBy : myr;
      totalSpent += myShare;
      spendingByDate[e.date] = (spendingByDate[e.date] || 0) + myShare;
      spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + myShare;
    }
  }
  totalSpent = Math.round(totalSpent * 100) / 100;

  // Compute activity costs in MYR
  let activityCostsMyr = 0;
  if (activities) {
    for (const a of activities) {
      if (a.cost) {
        activityCostsMyr += parseFloat(a.cost) / fxRate;
      }
    }
  }
  activityCostsMyr = Math.round(activityCostsMyr * 100) / 100;

  const budgetTotal = traveller.budget_total ?? 0;
  const remaining = budgetTotal - totalSpent;
  const dailyFree = tripDays > 0 ? (budgetTotal - activityCostsMyr) / tripDays : 0;

  return {
    travellerId: traveller.id,
    budgetTotal,
    totalSpent,
    remaining: Math.round(remaining * 100) / 100,
    dailyFree: Math.round(dailyFree * 100) / 100,
    activityCostsMyr,
    tripDays,
    spendingByDate,
    spendingByCategory,
  };
}
