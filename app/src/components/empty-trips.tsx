import Link from "next/link";
import { Plus } from "lucide-react";

export function EmptyTrips() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-4">
        <span className="text-2xl">🧳</span>
      </div>
      <h2 className="text-lg font-semibold text-ink mb-1">Where to?</h2>
      <p className="text-sm text-muted max-w-[280px] mb-6">
        Create your first trip to start planning your itinerary and tracking
        your budget.
      </p>
      <Link
        href="/trips/new"
        className="flex items-center gap-1.5 h-11 px-5 bg-accent text-accent-on font-medium rounded-md hover:bg-accent-hover transition-colors"
      >
        <Plus size={18} />
        New trip
      </Link>
    </div>
  );
}
