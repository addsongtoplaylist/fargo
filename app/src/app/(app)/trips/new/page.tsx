"use client";

import { useState, useRef } from "react";
import { Column } from "@/components/column";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createTrip } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { DestinationSearch, type Destination } from "@/components/destination-search";

const tripTypes = [
  "Free & easy",
  "City break",
  "Road trip",
  "Beach & resort",
  "Adventure",
  "Business",
] as const;

const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "KRW", label: "KRW — Korean Won" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "TWD", label: "TWD — Taiwan Dollar" },
  { code: "HKD", label: "HKD — Hong Kong Dollar" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "MYR", label: "MYR — Malaysian Ringgit" },
  { code: "THB", label: "THB — Thai Baht" },
  { code: "VND", label: "VND — Vietnamese Dong" },
  { code: "IDR", label: "IDR — Indonesian Rupiah" },
  { code: "PHP", label: "PHP — Philippine Peso" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "NZD", label: "NZD — New Zealand Dollar" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "CHF", label: "CHF — Swiss Franc" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "TRY", label: "TRY — Turkish Lira" },
  { code: "BRL", label: "BRL — Brazilian Real" },
  { code: "MXN", label: "MXN — Mexican Peso" },
] as const;

/** ISO country code → currency code (covers CURRENCIES list above) */
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", JP: "JPY", KR: "KRW", CN: "CNY",
  TW: "TWD", HK: "HKD", SG: "SGD", MY: "MYR", TH: "THB",
  VN: "VND", ID: "IDR", PH: "PHP", IN: "INR", AU: "AUD",
  NZ: "NZD", CA: "CAD", CH: "CHF", AE: "AED", TR: "TRY",
  BR: "BRL", MX: "MXN",
  // Eurozone
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
  BE: "EUR", AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR",
  GR: "EUR", LU: "EUR", SK: "EUR", SI: "EUR", EE: "EUR",
  LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR", HR: "EUR",
};

export default function NewTripPage() {
  const [selectedType, setSelectedType] = useState<string>("Free & easy");
  const [destination, setDestination] = useState<Destination | null>(null);
  const [currency, setCurrency] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const { toast } = useToast();

  function handleDestinationChange(dest: Destination | null) {
    setDestination(dest);
    // Auto-fill currency based on country code
    if (dest?.countryCode) {
      const matched = COUNTRY_CURRENCY[dest.countryCode];
      if (matched) setCurrency(matched);
    }
  }

  async function handleSubmit(formData: FormData) {
    // BUG-7 fix: ref guard catches rapid double-clicks before React state updates
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    formData.set("tripType", selectedType);
    if (destination) {
      formData.set("destination", destination.name);
      formData.set("destinationCountry", destination.country);
      formData.set("destinationCountryCode", destination.countryCode);
      formData.set("destinationLat", String(destination.lat));
      formData.set("destinationLng", String(destination.lng));
    }
    try {
      const result = await createTrip(formData);
      if (result?.error) {
        toast(result.error, "error");
        setSubmitting(false);
        submittingRef.current = false;
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
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-ink transition-colors -ml-2"
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
          <DestinationSearch
            value={destination}
            onChange={handleDestinationChange}
            placeholder="e.g. Hanoi, Vietnam"
          />
          {/* Hidden input for form validation — destination is required */}
          <input type="hidden" name="destination" value={destination?.name ?? ""} required />
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
            <select
              name="localCurrency"
              required
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-11 px-3 bg-card border border-border rounded-md text-ink focus:outline-none focus:border-accent transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b6560%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8"
            >
              <option value="" disabled>Select currency</option>
              {CURRENCIES.map(({ code, label }) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
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
          className="w-full h-11 bg-accent text-accent-on font-medium rounded-md hover:bg-accent-hover transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Creating trip…" : "Create trip"}
        </button>
      </form>
    </Column>
  );
}
