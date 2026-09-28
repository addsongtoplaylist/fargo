import Link from "next/link";
import { Map as MapIcon, Plus } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import { buttonClasses } from "@/components/ui/button";

export function EmptyTrips() {
  return (
    <div className="pt-16">
      <Empty
        size="page"
        icon={MapIcon}
        title="Where to?"
        message="Create your first trip to start planning your itinerary and tracking your budget."
        action={
          <Link href="/trips/new" className={buttonClasses("primary")}>
            <Plus size={16} strokeWidth={2.2} aria-hidden />
            New trip
          </Link>
        }
      />
    </div>
  );
}
