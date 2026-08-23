"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTrip } from "@/lib/trip-context";
import { updateTrip, deleteTrip } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function TripSettingsPage() {
  const trip = useTrip();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(trip?.name ?? "");
  const [destination, setDestination] = useState(trip?.destination ?? "");
  const [startDate, setStartDate] = useState(trip?.start_date ?? "");
  const [endDate, setEndDate] = useState(trip?.end_date ?? "");
  const [localCurrency, setLocalCurrency] = useState(trip?.local_currency ?? "");
  const [fxRate, setFxRate] = useState(trip?.fx_rate?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!trip) return null;

  async function handleSave() {
    if (!name.trim() || !destination.trim() || !startDate || !endDate) {
      toast("All fields are required", "error");
      return;
    }
    setSaving(true);
    const result = await updateTrip(trip!.id, {
      name: name.trim(),
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
      local_currency: localCurrency.toUpperCase(),
      fx_rate: parseFloat(fxRate) || undefined,
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
      router.push("/trips");
    }
  }

  return (
    <div className="min-h-full bg-ground">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="mx-auto max-w-[var(--max-width-column)] px-4 flex items-center h-12 gap-3">
          <button
            onClick={() => router.back()}
            className="text-muted hover:text-ink transition-colors -ml-1"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold text-ink">Trip Settings</h1>
        </div>
      </header>

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
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-accent transition-colors"
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
        message={`Are you sure you want to delete "${name}"? This will remove all activities, expenses, and checklists. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
