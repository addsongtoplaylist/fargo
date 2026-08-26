"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrip } from "@/lib/trip-context";
import { updateTrip, deleteTrip, getOrCreateShareCode, getOrCreateInviteCode } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DestinationSearch, type Destination } from "@/components/destination-search";
import { Share2, Link as LinkIcon, Users, Check } from "lucide-react";

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

  async function handleShareLink() {
    setShareLoading(true);
    try {
      const code = await getOrCreateShareCode(trip!.id);
      const url = `${window.location.origin}/s/${code}`;
      await copyToClipboard(`Check out my trip on Fargo ✈️\n${url}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      toast("Failed to generate share link", "error");
    } finally {
      setShareLoading(false);
    }
  }

  async function handleInviteLink() {
    setInviteLoading(true);
    try {
      const code = await getOrCreateInviteCode(trip!.id);
      const url = `${window.location.origin}/invite/${code}`;
      await copyToClipboard(url);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}
