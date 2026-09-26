import { notFound } from "next/navigation";
import { getSharedTrip } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { SharedTripView } from "@/components/shared/shared-trip-view";

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Shared trip bundle (no auth required) + auth state in parallel.
  // Expenses are intentionally not shared.
  const [shared, account] = await Promise.all([
    getSharedTrip(code),
    getOrCreateAccount().catch(() => null),
  ]);

  if (!shared) {
    notFound();
  }

  return (
    <SharedTripView
      trip={shared.trip}
      activities={shared.activities}
      checklists={shared.checklists}
      ideas={shared.ideas}
      shareCode={code}
      isSignedIn={!!account}
    />
  );
}
