"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrip } from "@/lib/trip-context";
import { updateTrip, deleteTrip, getOrCreateShareCode } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DestinationSearch, type Destination } from "@/components/destination-search";
import { LocationSearch } from "@/components/schedule/location-search";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { FieldStack, fieldClass } from "@/components/ui/field";

export default function TripSettingsPage() {
  const trip = useTrip();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(trip?.name ?? "");
  const [destination, setDestination] = useState<Destination | null>(
    trip?.destination
      ? {
          name: trip.destination,
          country: trip.destination_country ?? "",
          countryCode: trip.destination_country_code ?? "",
          lat: trip.destination_lat ?? 0,
          lng: trip.destination_lng ?? 0,
        }
      : null
  );
  const [baseCity, setBaseCity] = useState<{ name: string; lat: number; lng: number } | null>(
    trip?.base_city && trip.base_lat != null && trip.base_lng != null
      ? { name: trip.base_city, lat: trip.base_lat, lng: trip.base_lng }
      : null
  );
  const [startDate, setStartDate] = useState(trip?.start_date ?? "");
  const [endDate, setEndDate] = useState(trip?.end_date ?? "");
  const [localCurrency, setLocalCurrency] = useState(trip?.local_currency ?? "");
  const [fxRate, setFxRate] = useState(trip?.fx_rate?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Share/invite state
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  // Codes known up front so a tap can copy immediately — iOS only allows a
  // clipboard write straight after a tap, not after a server round-trip
  const [shareCode, setShareCode] = useState<string | null>(trip?.share_code ?? null);
  // Link shown on screen when it was just created or couldn't be copied
  // (Invite link moved to Overview → Travellers → Invite; owner, 2026-09-29)
  const [shownLink, setShownLink] = useState<{ kind: "share"; url: string } | null>(null);

  if (!trip) return null;

  async function handleSave() {
    if (!name.trim() || !destination || !startDate || !endDate) {
      toast("All fields are required", "error");
      return;
    }
    setSaving(true);
    const result = await updateTrip(trip!.id, {
      name: name.trim(),
      destination: destination.name,
      start_date: startDate,
      end_date: endDate,
      local_currency: localCurrency.toUpperCase(),
      fx_rate: parseFloat(fxRate) || undefined,
      destination_country: destination.country || null,
      destination_country_code: destination.countryCode || null,
      destination_lat: destination.lat || null,
      destination_lng: destination.lng || null,
      base_city: baseCity?.name ?? null,
      base_lat: baseCity?.lat ?? null,
      base_lng: baseCity?.lng ?? null,
    });
    setSaving(false);
    if (result.error) {
      toast(result.error, "error");
    } else {
      toast("Trip updated");
      router.push(`/trips/${trip!.id}/overview`);
      router.refresh();
    }
  }

  async function handleDelete() {
    const result = await deleteTrip(trip!.id);
    if (result.error) {
      toast(result.error, "error");
    } else {
      router.push("/trips?noauto=1");
    }
  }

  function linkUrl(_kind: "share", code: string) {
    return `${window.location.origin}/s/${code}`;
  }

  /** Must be called directly from a tap handler (no awaits before it). */
  async function copyLink(kind: "share", code: string) {
    const url = linkUrl(kind, code);
    const text = `Check out my trip on Fargo ✈️\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setShownLink(null);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShownLink({ kind, url });
      toast("Couldn't copy automatically. Copy the link below.", "info");
    }
  }

  async function handleShareLink() {
    if (shareCode) return copyLink("share", shareCode);
    // First time: create the link, then show it with its own Copy button
    setShareLoading(true);
    try {
      const code = await getOrCreateShareCode(trip!.id);
      setShareCode(code);
      setShownLink({ kind: "share", url: linkUrl("share", code) });
    } catch {
      toast("Failed to generate share link", "error");
    } finally {
      setShareLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[var(--max-width-column)] px-4 pt-1 pb-8 space-y-5">
      {/* Trip */}
      <section className="bg-surface rounded-card p-4 space-y-4">
        <FieldStack label="Trip name" htmlFor="set-name">
          <input id="set-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </FieldStack>

        <FieldStack label="Destination">
          <DestinationSearch value={destination} onChange={setDestination} placeholder="Search destination…" />
        </FieldStack>

        {/* Base city — weather fallback when no Stay applies */}
        <div>
          <p className="text-[13px] font-medium text-fg-muted mb-1.5">Base city</p>
          <LocationSearch
            value={baseCity}
            onChange={setBaseCity}
            countries={destination?.countryCode ? [destination.countryCode] : undefined}
            proximity={destination?.lat && destination?.lng ? { lat: destination.lat, lng: destination.lng } : undefined}
          />
          <p className="text-xs text-fg-muted mt-1.5 leading-relaxed">
            Used for the weather on Overview before your first Stay, or when a Stay has no place set.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FieldStack label="Start date" htmlFor="set-start">
            <input id="set-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`${fieldClass} min-w-0`} />
          </FieldStack>
          <FieldStack label="End date" htmlFor="set-end">
            <input id="set-end" type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className={`${fieldClass} min-w-0`} />
          </FieldStack>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FieldStack label="Local currency" htmlFor="set-currency">
            <input id="set-currency" type="text" value={localCurrency} onChange={(e) => setLocalCurrency(e.target.value)} className={`${fieldClass} uppercase`} />
          </FieldStack>
          <FieldStack label="1 MYR =" htmlFor="set-rate">
            <input
              id="set-rate"
              type="number"
              inputMode="decimal"
              value={fxRate}
              onChange={(e) => setFxRate(e.target.value)}
              className={`${fieldClass} tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
          </FieldStack>
        </div>

        <Button size="lg" full onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </section>

      {/* Share (read-only link) */}
      <section>
        <Eyebrow className="mx-1 mb-2">Share</Eyebrow>
        <div className="bg-surface rounded-card p-4">
          <p className="text-[13px] text-fg-muted mb-3 leading-relaxed">
            Anyone with the link can view the plan — no money shown. To add people to the trip, use Invite on Overview.
          </p>
          <Button variant="soft" full icon={shareCopied ? Check : Share2} onClick={handleShareLink} disabled={shareLoading}>
            {shareCopied ? "Link copied!" : shareLoading ? "Generating…" : "Copy share link"}
          </Button>
          {shownLink && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs text-fg-muted">Share link ready</p>
              <div className="flex items-center gap-2">
                <input
                  id="shown-link"
                  readOnly
                  aria-label="Share link"
                  value={shownLink.url}
                  onFocus={(e) => e.currentTarget.select()}
                  className={`${fieldClass} flex-1 min-w-0 text-xs`}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (shareCode) copyLink("share", shareCode);
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <Eyebrow className="mx-1 mb-2">Danger zone</Eyebrow>
        <Button variant="danger-outline" full onClick={() => setShowDeleteConfirm(true)}>
          Delete trip
        </Button>
      </section>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete trip"
        message={`Are you sure you want to delete "${name}"? This will permanently remove all activities, expenses, checklists, and traveller data. All members will lose access. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
