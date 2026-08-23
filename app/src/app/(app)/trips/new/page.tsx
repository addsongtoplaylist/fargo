"use client";

import { useState } from "react";
import { Column } from "@/components/column";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createTrip } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";

const tripTypes = [
  "Free & easy",
  "City break",
  "Road trip",
  "Beach & resort",
  "Adventure",
  "Business",
] as const;

export default function NewTripPage() {
  const [selectedType, setSelectedType] = useState<string>("Free & easy");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    formData.set("tripType", selectedType);
    try {
      const result = await createTrip(formData);
      if (result?.error) {
        toast(result.error, "error");
        setSubmitting(false);
      }
      // On success, createTrip calls redirect() which throws (expected)
    } catch {
      // redirect() throws a NEXT_REDIRECT error — that's normal.
      // Only real errors should show a toast, which we handle above via result.error
    }
  }

  return (
    <Column className="py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/trips"
          className="text-muted hover:text-ink transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold">New trip</h1>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {/* Trip name */}
        <div>
          <label className="block text-[13px] font-medium text-muted mb-1">
            Trip name
          </label>
          <input
            name="name"
            type="text"
            placeholder="e.g. Vietnam 2026"
            required
            className="w-full h-11 px-3 bg-card border border-border rounded-md text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-[13px] font-medium text-muted mb-1">
            Destination
          </label>
          <input
            name="destination"
            type="text"
            placeholder="e.g. Hanoi, Vietnam"
            required
            className="w-full h-11 px-3 bg-card border border-border rounded-md text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-medium text-muted mb-1">
              Start date
            </label>
            <input
              name="startDate"
              type="date"
              required
              className="w-full h-11 px-3 bg-card border border-border rounded-md text-ink focus:outline-none focus:border-accent transition-colors min-w-0"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-muted mb-1">
              End date
            </label>
            <input
              name="endDate"
              type="date"
              required
              className="w-full h-11 px-3 bg-card border border-border rounded-md text-ink focus:outline-none focus:border-accent transition-colors min-w-0"
            />
          </div>
        </div>

        {/* Trip type */}
        <div>
          <label className="block text-[13px] font-medium text-muted mb-1.5">
            Trip type
          </label>
          <div className="flex flex-wrap gap-2">
            {tripTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
                  selectedType === type
                    ? "border-accent bg-accent-soft text-accent font-medium"
                    : "border-border text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Currency + rate */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-medium text-muted mb-1">
              Local currency
            </label>
            <input
              name="localCurrency"
              type="text"
              placeholder="e.g. VND"
              required
              className="w-full h-11 px-3 bg-card border border-border rounded-md text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-muted mb-1">
              1 MYR =
            </label>
            <input
              name="fxRate"
              type="number"
              step="any"
              placeholder="e.g. 5600"
              required
              className="w-full h-11 px-3 bg-card border border-border rounded-md text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-accent text-accent-on font-medium rounded-md hover:bg-accent-hover transition-colors mt-2 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create trip"}
        </button>
      </form>
    </Column>
  );
}
