import { HomeButton } from "@/components/home-button";
import { DiscoverView } from "@/components/bites/discover-view";
import type { DiscoverTrip } from "@/components/bites/discover-trips";
import { getMyTrips, type MyTrip } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";

/**
 * Discover from home (v0.7.0). Place search is limited to the ongoing trip's
 * country (anywhere between trips); "Add to a trip" offers your ongoing and
 * upcoming trips, the ongoing one first. Inside a trip, Discover stays as is.
 */
export default async function HomeDiscoverPage() {
  const [{ active, upcoming }, account] = await Promise.all([getMyTrips(), getOrCreateAccount()]);

  const ongoing = [...active].sort((a, b) => b.start_date.localeCompare(a.start_date));
  const later = [...upcoming].sort((a, b) => a.start_date.localeCompare(b.start_date));
  const toDiscover = (t: MyTrip): DiscoverTrip => ({
    id: t.id,
    name: t.name,
    start_date: t.start_date,
    end_date: t.end_date,
    countryCode: t.destination_country_code ?? null,
    isPlanner: t.travellers?.some((tr) => tr.account_id === account?.id && tr.role === "planner") ?? false,
  });
  const trips = [...ongoing, ...later].map(toDiscover);
  const here = ongoing[0];

  return (
    <div className="mx-auto w-full max-w-[var(--max-width-column)] pt-4 pb-8">
      <div className="flex items-center gap-3 mb-5 px-4">
        <HomeButton />
        <h1 className="text-[30px] font-bold text-fg tracking-[-0.5px]">Discover</h1>
      </div>
      <DiscoverView
        trips={trips}
        near={here ? { destination: here.destination, countryCode: here.destination_country_code ?? null } : null}
      />
    </div>
  );
}
