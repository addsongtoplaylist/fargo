"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrip } from "@/lib/trip-context";
import { updateTrip, deleteTrip, getOrCreateShareCode, getOrCreateInviteCode } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DestinationSearch, type Destination } from "@/components/destination-search";
import { LocationSearch } from "@/components/schedule/location-search";
import { Share2, Users, Check } from "lucide-react";

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
  const [inviteCopied, setInviteCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  // Codes known up front so a tap can copy immediately — iOS only allows a
  // clipboard write straight after a tap, not after a server round-trip
  const [shareCode, setShareCode] = useState<string | null>(trip?.share_code ?? null);
  const [inviteCode, setInviteCode] = useState<string | null>(trip?.invite_code ?? null);
  // Link shown on screen when it was just created or couldn't be copied
  const [shownLink, setShownLink] = useState<{ kind: "share" | "invite"; url: string } | null>(null);

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

  function linkUrl(kind: "share" | "invite", code: string) {
    return `${window.location.origin}/${kind === "share" ? "s" : "invite"}/${code}`;
  }

  /** Must be called directly from a tap handler (no awaits before it). */
  async function copyLink(kind: "share" | "invite", code: string) {
    const url = linkUrl(kind, code);
    const text = kind === "share" ? `Check out my trip on Fargo ✈️\n${url}` : url;
    try {
      await navigator.clipboard.writeText(text);
      setShownLink(null);
      if (kind === "share") {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } else {
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
      }
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

  async function handleInviteLink() {
    if (inviteCode) return copyLink("invite", inviteCode);
    setInviteLoading(true);
    try {
      const code = await getOrCreateInviteCode(trip!.id);
      setInviteCode(code);
      setShownLink({ kind: "invite", url: linkUrl("invite", code) });
    } catch {
      toast("Failed to generate invite link", "error");
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-ground">
      <div className="mx-auto max-w-[var(--max-width-column)] px-4 py-5 space-y-4">
        {/* Trip name */}
        <div>
          <label className="text-xs font-medium text-muted block mb-1">Trip name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="text-xs font-medium text-muted block mb-1">Destination</label>
          <DestinationSearch
            value={destination}
            onChange={setDestination}
            placeholder="Search destination…"
          />
        </div>

        {/* Base city — used for the weather on Overview */}
        <div>
          <label className="text-xs font-medium text-muted block mb-1">Base city</label>
          <LocationSearch
            value={baseCity}
            onChange={setBaseCity}
            countries={destination?.countryCode ? [destination.countryCode] : undefined}
            proximity={destination?.lat && destination?.lng ? { lat: destination.lat, lng: destination.lng } : undefined}
          />
          <p className="text-[11px] text-muted mt-1">Where you&apos;re staying — shows the temperature on Overview.</p>
        </div>

        {/* Dates */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted block mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-muted block mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Currency */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted block mb-1">Local currency</label>
            <input
              type="text"
              value={localCurrency}
              onChange={(e) => setLocalCurrency(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-muted block mb-1">FX rate to MYR</label>
            <input
              type="number"
              inputMode="decimal"
              value={fxRate}
              onChange={(e) => setFxRate(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-accent transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        {/* Share & Invite */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted mb-2">Share & invite</p>
          <div className="space-y-2">
            <button
              onClick={handleShareLink}
              disabled={shareLoading}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent-soft transition-colors disabled:opacity-50"
            >
              {shareCopied ? (
                <>
                  <Check size={15} />
                  Link copied!
                </>
              ) : (
                <>
                  <Share2 size={15} />
                  {shareLoading ? "Generating…" : "Copy share link"}
                </>
              )}
            </button>
            <button
              onClick={handleInviteLink}
              disabled={inviteLoading}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent-soft transition-colors disabled:opacity-50"
            >
              {inviteCopied ? (
                <>
                  <Check size={15} />
                  Invite link copied!
                </>
              ) : (
                <>
                  <Users size={15} />
                  {inviteLoading ? "Generating…" : "Copy invite link"}
                </>
              )}
            </button>
            {shownLink && (
              <div className="bg-card border border-border rounded-lg p-2 space-y-1.5">
                <p className="text-[11px] text-muted">
                  {shownLink.kind === "share" ? "Share link" : "Invite link"} ready
                </p>
                <div className="flex items-center gap-2">
                  <input
                    id="shown-link"
                    readOnly
                    value={shownLink.url}
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 min-w-0 bg-ground border border-border rounded-md px-2 py-1.5 text-xs text-ink outline-none"
                  />
                  <button
                    onClick={() => {
                      const code = shownLink.kind === "share" ? shareCode : inviteCode;
                      if (code) copyLink(shownLink.kind, code);
                    }}
                    className="shrink-0 px-3 py-1.5 bg-accent text-accent-on text-xs font-medium rounded-md hover:bg-accent-hover transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
            <p className="text-[11px] text-muted">
              Share link lets people view your trip. Invite link lets them join as a member.
            </p>
          </div>
        </div>

        {/* Danger zone */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted mb-2">Danger zone</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2.5 text-sm font-medium text-money-over border border-money-over/30 rounded-lg hover:bg-money-over/10 transition-colors"
          >
            Delete trip
          </button>
        </div>
      </div>

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
