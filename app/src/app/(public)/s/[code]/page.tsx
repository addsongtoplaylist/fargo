import { notFound } from "next/navigation";
import { getTripByShareCode } from "@/lib/actions/trip";
import { getActivities } from "@/lib/actions/activity";
import { getExpenses, getBudgetSummary } from "@/lib/actions/expense";
import { getChecklists } from "@/lib/actions/checklist";
import { getIdeas } from "@/lib/actions/idea";
import { SharedTripView } from "@/components/shared/shared-trip-view";

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const trip = await getTripByShareCode(code);

  if (!trip) {
    notFound();
  }

  // Fetch all trip data in parallel
  const [activities, expenses, checklists, ideas] = await Promise.all([
    getActivitiesPublic(trip.id),
    getExpensesPublic(trip.id),
    getChecklistsPublic(trip.id),
    getIdeasPublic(trip.id),
  ]);

  return (
    <SharedTripView
      trip={trip}
      activities={activities}
      expenses={expenses}
      checklists={checklists}
      ideas={ideas}
    />
  );
}

// Public data fetchers (no auth required — trip was looked up by share code)
async function getActivitiesPublic(tripId: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: true })
    .order("sort_order", { ascending: true });
  return data ?? [];
}

async function getExpensesPublic(tripId: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function getChecklistsPublic(tripId: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("checklists")
    .select("*, checklist_items(*)")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

async function getIdeasPublic(tripId: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("ideas")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  return data ?? [];
}
