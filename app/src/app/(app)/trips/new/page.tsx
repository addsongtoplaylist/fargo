"use client";

import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, parseISO } from "date-fns";
import Link from "next/link";
import { createTrip } from "@/lib/actions/trip";
import { useToast } from "@/components/toast";
import { DestinationSearch, type Destination } from "@/components/destination-search";
import { Button, TextButton } from "@/components/ui/button";
import { TripCover } from "@/components/trip-cover";
import { resizeImage, uploadTripCover } from "@/lib/cover-upload";
import { Chip } from "@/components/ui/chip";
import { Eyebrow } from "@/components/ui/card";

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
    // With a cover photo, createTrip returns the new id so the photo can be
    // uploaded straight after (P10); without one it redirects as before
    if (coverPhoto) formData.set("returnId", "1");
    try {
      const result = await createTrip(formData);
      if (result?.error) {
        toast(result.error, "error");
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }
      if (result?.tripId) {
        if (coverPhoto) {
          const uploaded = await uploadTripCover(result.tripId, coverPhoto);
          if (uploaded.error) toast("Trip created, but the photo didn't upload. Add it in Trip settings.", "error");
        }
        router.push(`/trips/${result.tripId}/overview`);
      }
      // Without a photo, createTrip calls redirect() which throws (expected)
    } catch {
      // redirect() throws a NEXT_REDIRECT error — that's normal.
      // Only real errors should show a toast, which we handle above via result.error
    }
  }

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fxRate, setFxRate] = useState("");
  // Cover photo (P10): shrunk on pick, uploaded after the trip is created
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverPhoto, setCoverPhoto] = useState<Blob | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);

  async function handleCoverPick(file: File | undefined) {
    if (!file) return;
    setCoverBusy(true);
    try {
      const photo = await resizeImage(file);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPhoto(photo);
      setCoverPreview(URL.createObjectURL(photo));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't add the photo", "error");
    } finally {
      setCoverBusy(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  function clearCover() {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPhoto(null);
    setCoverPreview(null);
  }

  // Step 1 is done when all four are filled and the dates are in order
  const datesOk = !!startDate && !!endDate && endDate >= startDate;
  const step1Done = !!name.trim() && !!destination && datesOk;
  const step2Done = !!currency && parseFloat(fxRate) > 0;
  const days = datesOk ? differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1 : 0;

  const ROW = "flex items-center gap-3 min-h-[52px] px-4";
  const LABEL = "text-sm text-fg-muted w-[112px] shrink-0 whitespace-nowrap";
  const BARE = "flex-1 min-w-0 h-11 bg-transparent text-right text-[15px] text-fg placeholder:text-fg-faint outline-none";
  const DATE_PILL =
    "h-9 px-3.5 rounded-full bg-page text-sm text-fg tabular-nums outline-none focus:ring-2 focus:ring-brand/40 min-w-0 w-[140px]";

  return (
    <div className="mx-auto w-full max-w-[var(--max-width-column)] min-h-dvh flex flex-col">
      {/* Top: close / back · progress */}
      <div className="px-4 pt-4 flex items-center gap-3.5">
        {step === 1 ? (
          <Link
            href="/trips?noauto=1"
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-fg shrink-0"
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            aria-label="Back to step 1"
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-fg shrink-0"
          >
            <ArrowLeft size={20} strokeWidth={2} aria-hidden />
          </button>
        )}
        <div className="flex-1 flex gap-1.5" aria-hidden>
          <span className="flex-1 h-1 rounded-full bg-brand" />
          <span className={`flex-1 h-1 rounded-full ${step === 2 ? "bg-brand" : "bg-line"}`} />
        </div>
        <span className="text-xs text-fg-muted shrink-0">{step} of 2</span>
      </div>

      <h1 className="mx-5 mt-6 text-[26px] font-bold text-fg tracking-[-0.4px]">{step === 1 ? "New trip" : "Trip details"}</h1>
      <p className="mx-5 mt-1 mb-5 text-sm text-fg-muted">{step === 1 ? "Where and when?" : "Almost there."}</p>

      {/* One form, two views — both steps stay mounted so Back keeps what you typed */}
      <form action={handleSubmit} className="flex-1 flex flex-col">
        <div className={`px-4 space-y-3.5 ${step === 1 ? "" : "hidden"}`}>
          <div className="bg-surface rounded-card">
            <div className={ROW}>
              <label htmlFor="trip-name" className={LABEL}>Trip name</label>
              <input
                id="trip-name"
                name="name"
                type="text"
                placeholder="e.g. Vietnam 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={BARE}
              />
            </div>
            <div className="h-px bg-line ml-4" />
            <div className={ROW}>
              <span className={LABEL}>Destination</span>
              <div className="flex-1 min-w-0 relative">
                <DestinationSearch value={destination} onChange={handleDestinationChange} placeholder="e.g. Vietnam" bare />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-card px-4 py-3.5">
            <div className="flex justify-between text-[13px] text-fg-muted">
              <label htmlFor="trip-start">Start</label>
              {days > 0 && <span className="font-semibold text-brand">{days} day{days === 1 ? "" : "s"}</span>}
              <label htmlFor="trip-end">End</label>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <input
                id="trip-start"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={DATE_PILL}
              />
              <ArrowRight size={18} className="text-fg-faint shrink-0" aria-hidden />
              <input
                id="trip-end"
                name="endDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className={DATE_PILL}
              />
            </div>
            {startDate && endDate && endDate < startDate && (
              <p className="text-[13px] font-medium text-money-warn mt-2">End date is before the start date</p>
            )}
          </div>
        </div>

        <div className={`px-4 space-y-5 ${step === 2 ? "" : "hidden"}`}>
          <div>
            <Eyebrow className="mx-1 mb-2">Trip type</Eyebrow>
            <div className="bg-surface rounded-card px-4 py-3.5 flex flex-wrap gap-2">
              {tripTypes.map((type) => (
                <Chip key={type} selected={selectedType === type} onClick={() => setSelectedType(type)}>
                  {type}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow className="mx-1 mb-2">Money</Eyebrow>
            <div className="bg-surface rounded-card">
              <div className={ROW}>
                <label htmlFor="trip-currency" className={LABEL}>Local currency</label>
                <select
                  id="trip-currency"
                  name="localCurrency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`${BARE} appearance-none pr-1 [text-align-last:right]`}
                >
                  <option value="" disabled>Select</option>
                  {CURRENCIES.map(({ code, label }) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-fg-faint shrink-0 -ml-1" aria-hidden />
              </div>
              <div className="h-px bg-line ml-4" />
              <div className={ROW}>
                <label htmlFor="trip-rate" className={LABEL}>1 MYR =</label>
                <input
                  id="trip-rate"
                  name="fxRate"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="e.g. 5600"
                  value={fxRate}
                  onChange={(e) => setFxRate(e.target.value)}
                  className={`${BARE} tabular-nums`}
                />
                {currency && <span className="text-sm text-fg-muted shrink-0">{currency}</span>}
              </div>
            </div>
            <p className="text-xs text-fg-muted mx-1 mt-2 leading-relaxed">
              Currency picked from your destination. Enter today&apos;s rate — you can change it later in Trip settings.
            </p>
          </div>
          {/* Cover photo (P10) — optional */}
          <div>
            <Eyebrow className="mx-1 mb-2">Optional</Eyebrow>
            <div className="bg-surface rounded-card flex items-center gap-3 px-4 min-h-[64px]">
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview of the picked photo
                <img src={coverPreview} alt="" aria-hidden className="w-11 h-11 rounded-[12px] object-cover shrink-0" />
              ) : (
                <TripCover tripId={name || "new-trip"} destination={destination?.name ?? ""} size={44} radius={12} />
              )}
              <span className="flex-1 text-sm font-medium text-fg">Cover photo</span>
              {coverBusy ? (
                <Loader2 size={18} className="text-fg-muted animate-spin" aria-label="Preparing photo" />
              ) : (
                <div className="flex items-center gap-3">
                  {coverPhoto && (
                    <TextButton tone="danger" onClick={clearCover}>
                      Remove
                    </TextButton>
                  )}
                  <Button variant="soft" size="sm" icon={coverPhoto ? undefined : ImagePlus} onClick={() => coverInputRef.current?.click()}>
                    {coverPhoto ? "Change" : "Add"}
                  </Button>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Choose a cover photo"
                onChange={(e) => handleCoverPick(e.target.files?.[0])}
              />
            </div>
          </div>
        </div>

        {/* Pinned action */}
        <div className="mt-auto sticky bottom-0 px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-page">
          {step === 1 ? (
            <Button size="lg" full disabled={!step1Done} onClick={() => setStep(2)}>
              Next
            </Button>
          ) : (
            <Button type="submit" size="lg" full disabled={!step2Done || submitting}>
              {submitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
              {submitting ? "Creating trip…" : "Create trip"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
