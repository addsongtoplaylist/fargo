import Image from "next/image";
import { TripCover } from "@/components/trip-cover";
import { AvatarStack } from "@/components/ui/avatar";
import { formatDate } from "@/lib/dates";

/** Shared invite layout (redesign P8a): logo, "You've been invited", trip card, footnote. */
export function InviteShell({ children, footnote }: { children: React.ReactNode; footnote: string }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10 bg-page">
      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="Fargo" width={96} height={36} priority />
          <p className="text-sm text-fg-muted mt-2">You&apos;ve been invited to a trip</p>
        </div>
        {children}
        <p className="text-center text-xs text-fg-muted mt-4 leading-relaxed">{footnote}</p>
      </div>
    </div>
  );
}

/** Trip summary at the top of the invite card: colour cover, name, place · dates, who's in. */
export function InviteTripSummary({
  trip,
}: {
  trip: { id?: string; name: string; destination: string; start_date: string; end_date: string; travellers?: { display_name: string }[] };
}) {
  const names = (trip.travellers ?? []).map((t) => t.display_name);
  return (
    <div className="flex items-start gap-3.5">
      <TripCover tripId={trip.id ?? trip.name} destination={trip.destination} size={60} radius={16} />
      <div className="flex-1 min-w-0 pt-0.5">
        <h2 className="text-[17px] font-bold text-fg leading-tight truncate">{trip.name}</h2>
        <p className="text-[13px] text-fg-muted mt-1">
          {trip.destination} · {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
        </p>
        {names.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <AvatarStack names={names} size={22} max={5} />
            <span className="text-xs text-fg-muted">
              {names.length} {names.length === 1 ? "traveller" : "travellers"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
