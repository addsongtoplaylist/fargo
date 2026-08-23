"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { revalidatePath } from "next/cache";

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
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const amountMyr = fields.amount / fields.fxRate;

  const { error } = await supabase.from("expenses").insert({
    trip_id: tripId,
    date: fields.date,
    title: fields.title,
    category: fields.category,
    amount: fields.amount,
    amount_myr: Math.round(amountMyr * 100) / 100,
    paid_by: fields.paidBy,
    is_shared: fields.isShared ?? false,
    notes: fields.notes || null,
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
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const amountMyr = fields.amount / fields.fxRate;

  const { error } = await supabase
    .from("expenses")
    .update({
      date: fields.date,
      title: fields.title,
      category: fields.category,
      amount: fields.amount,
      amount_myr: Math.round(amountMyr * 100) / 100,
      paid_by: fields.paidBy,
      is_shared: fields.isShared ?? false,
      notes: fields.notes || null,
    })
    .eq("id", expenseId);

  if (error) {
    console.error("Failed to update expense:", error);
    throw new Error("Failed to update expense");
  }

  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

export async function deleteExpense(expenseId: string, tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    console.error("Failed to delete expense:", error);
    throw new Error("Failed to delete expense");
  }

  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

/** Get the total spent (in MYR) for a trip */
export async function getTripSpending(tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) return { total: 0, byDate: {} as Record<string, number>, byCategory: {} as Record<string, number> };

  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount_myr, date, category")
    .eq("trip_id", tripId);

  if (!expenses) return { total: 0, byDate: {} as Record<string, number>, byCategory: {} as Record<string, number> };

  let total = 0;
  const byDate: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const e of expenses) {
    const myr = parseFloat(e.amount_myr);
    total += myr;
    byDate[e.date] = (byDate[e.date] || 0) + myr;
    byCategory[e.category] = (byCategory[e.category] || 0) + myr;
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

  // Get the planner's traveller record with budget
  const { data: traveller } = await supabase
    .from("travellers")
    .select("id, budget_total")
    .eq("trip_id", tripId)
    .eq("account_id", account.id)
    .single();

  if (!traveller) return null;

  // Get the trip dates for day count
  const { data: trip } = await supabase
    .from("trips")
    .select("start_date, end_date")
    .eq("id", tripId)
    .single();

  if (!trip) return null;

  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const tripDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Get total spent
  const spending = await getTripSpending(tripId);

  // Get sum of activity costs (in MYR) for the planned layer
  const { data: activities } = await supabase
    .from("activities")
    .select("cost, cost_shared")
    .eq("trip_id", tripId)
    .not("cost", "is", null);

  // Get the trip's fx_rate for converting activity costs
  const { data: tripData } = await supabase
    .from("trips")
    .select("fx_rate")
    .eq("id", tripId)
    .single();

  const fxRate = tripData ? parseFloat(tripData.fx_rate) : 1;
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
  const remaining = budgetTotal - spending.total;
  const dailyFree = tripDays > 0 ? (budgetTotal - activityCostsMyr) / tripDays : 0;

  return {
    travellerId: traveller.id,
    budgetTotal,
    totalSpent: spending.total,
    remaining: Math.round(remaining * 100) / 100,
    dailyFree: Math.round(dailyFree * 100) / 100,
    activityCostsMyr,
    tripDays,
    spendingByDate: spending.byDate,
    spendingByCategory: spending.byCategory,
  };
}
