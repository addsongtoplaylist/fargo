"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateAccount } from "@/lib/account";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { createExpenseSchema, updateExpenseSchema, tripIdSchema, uuidSchema } from "@/lib/validations";
import { getTrip } from "@/lib/actions/trip";

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
  kind: "expense" | "settlement";
  split_type: SplitType;
  created_by: string | null;
  activity_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  expense_participants: { traveller_id: string; weight: string; share: string }[];
};

export type SplitType = "equal" | "shares" | "percent" | "amount";

type ExpenseFields = {
  date: string;
  title: string;
  category: string;
  amount: number; // local currency
  paidBy: string;
  splitType: SplitType;
  participants: { travellerId: string; weight: number }[];
  notes?: string;
};

export async function getExpenses(tripId: string): Promise<Expense[]> {
  const account = await getOrCreateAccount();
  if (!account) return [];

  const supabase = await createClient();

  return unstable_cache(
    async () => {
      const { data } = await supabase
        .from("expenses")
        .select("*, expense_participants(traveller_id, weight, share)")
        .eq("trip_id", tripId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      return (data as Expense[]) ?? [];
    },
    [`expenses-${tripId}-user-${account.id}`],
    { tags: [`expenses-${tripId}`], revalidate: 30 }
  )();
}

export async function createExpense(tripId: string, fields: ExpenseFields) {
  tripIdSchema.parse(tripId);
  const validated = createExpenseSchema.parse(fields);

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  // save_expense checks trip membership and edit rights, and saves the
  // expense with its participants in one go (MYR is derived from the trip rate)
  const { error } = await supabase.rpc("save_expense", {
    p_trip_id: tripId,
    p_expense_id: null,
    p_date: validated.date,
    p_title: validated.title,
    p_category: validated.category,
    p_amount: validated.amount,
    p_paid_by: validated.paidBy,
    p_split_type: validated.splitType,
    p_participants: validated.participants.map((p) => ({ traveller_id: p.travellerId, weight: p.weight })),
    p_notes: validated.notes || null,
  });

  if (error) {
    console.error("Failed to create expense:", error);
    throw new Error("Failed to create expense");
  }

  revalidateTag(`expenses-${tripId}`, "max");
  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

export async function updateExpense(expenseId: string, tripId: string, fields: ExpenseFields) {
  uuidSchema.parse(expenseId);
  tripIdSchema.parse(tripId);
  const validated = updateExpenseSchema.parse(fields);

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();

  const { error } = await supabase.rpc("save_expense", {
    p_trip_id: tripId,
    p_expense_id: expenseId,
    p_date: validated.date,
    p_title: validated.title,
    p_category: validated.category,
    p_amount: validated.amount,
    p_paid_by: validated.paidBy,
    p_split_type: validated.splitType,
    p_participants: validated.participants.map((p) => ({ traveller_id: p.travellerId, weight: p.weight })),
    p_notes: validated.notes || null,
  });

  if (error) {
    console.error("Failed to update expense:", error);
    throw new Error("Failed to update expense");
  }

  revalidateTag(`expenses-${tripId}`, "max");
  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

export async function deleteExpense(expenseId: string, tripId: string) {
  uuidSchema.parse(expenseId);
  tripIdSchema.parse(tripId);

  const account = await getOrCreateAccount();
  if (!account) throw new Error("Not signed in");

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_expense", { p_expense_id: expenseId });

  if (error) {
    console.error("Failed to delete expense:", error);
    throw new Error("Failed to delete expense");
  }

  revalidateTag(`expenses-${tripId}`, "max");
  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
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

  // budget_total is read from the cached getTrip() — bust it too
  revalidateTag(`trip-${tripId}`, "max");
  revalidateTag(`expenses-${tripId}`, "max");
  revalidatePath(`/trips/${tripId}/money`);
  revalidatePath(`/trips/${tripId}/schedule`);
}

/**
 * Get the planner's budget and computed daily free budget.
 *
 * Reuses cached getTrip() for trip dates, traveller count, and the user's
 * budget_total — eliminates 3 of the original 4 Supabase queries.
 * Only the expenses query remains unique to this function.
 *
 * Cached across requests (30s TTL); expense/budget mutations bust via revalidateTag.
 */
export async function getBudgetSummary(tripId: string) {
  const account = await getOrCreateAccount();
  if (!account) return null;

  // Reuse cached trip data — getTrip() is wrapped in React cache() +
  // unstable_cache, so this is essentially free (no extra DB query)
  const trip = await getTrip(tripId);
  if (!trip) return null;

  const travellers = trip.travellers ?? [];
  const myTraveller = travellers.find(
    (t: { account_id: string }) => t.account_id === account.id
  );
  if (!myTraveller) return null;

  const supabase = await createClient();

  return unstable_cache(
    async () => {
      // Only query: expenses. Trip dates, traveller count, and budget_total
      // all come from the cached getTrip() result above.
      // Budget = cash out of your pocket (D7, D14): only what you paid,
      // settlements included. Your share of others' payments doesn't count.
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount_myr, date, category")
        .eq("trip_id", tripId)
        .eq("paid_by", myTraveller.id);

      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const tripDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Fixed expense categories — deducted from budget before calculating daily free
      const FIXED_CATEGORIES = ["flights", "accommodation", "activities"];

      // Spending totals — the full amount of everything you paid
      let totalSpent = 0;
      let fixedExpensesMyr = 0;
      const spendingByDate: Record<string, number> = {};
      const spendingByCategory: Record<string, number> = {};

      if (expenses) {
        for (const e of expenses) {
          const myr = parseFloat(e.amount_myr);
          totalSpent += myr;
          spendingByDate[e.date] = (spendingByDate[e.date] || 0) + myr;
          spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + myr;

          // Fixed costs you paid (flights, stay, activities)
          if (FIXED_CATEGORIES.includes(e.category)) {
            fixedExpensesMyr += myr;
          }
        }
      }
      totalSpent = Math.round(totalSpent * 100) / 100;
      fixedExpensesMyr = Math.round(fixedExpensesMyr * 100) / 100;

      const budgetTotal = myTraveller.budget_total ?? 0;
      const remaining = budgetTotal - totalSpent;

      // Daily free = (total budget - fixed expenses) / total days
      // This is a STATIC number — it does not change with daily spending.
      // Fixed expenses = flights + accommodation + activities (your share).
      const dailyFree = tripDays > 0 ? (budgetTotal - fixedExpensesMyr) / tripDays : 0;

      return {
        travellerId: myTraveller.id,
        budgetTotal,
        totalSpent,
        remaining: Math.round(remaining * 100) / 100,
        dailyFree: Math.round(dailyFree * 100) / 100,
        fixedExpensesMyr,
        tripDays,
        spendingByDate,
        spendingByCategory,
      };
    },
    [`budget-${tripId}-user-${account.id}`],
    { tags: [`expenses-${tripId}`, `trip-${tripId}`], revalidate: 30 }
  )();
}
