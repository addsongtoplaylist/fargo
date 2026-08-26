"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/account";
import { useToast } from "@/components/toast";
import { COUNTRIES } from "@/lib/countries";

type ProfileSettingsProps = {
  homeCurrency: string;
  homeCountryCode: string | null;
};

export function ProfileSettings({
  homeCurrency,
  homeCountryCode,
}: ProfileSettingsProps) {
  const [countryCode, setCountryCode] = useState(homeCountryCode ?? "MY");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const currentCountry = COUNTRIES.find((c) => c.code === countryCode);

  async function handleSave(code: string) {
    setCountryCode(code);
    setSaving(true);
    const result = await updateProfile({ home_country_code: code });
    setSaving(false);
    if (result.error) {
      toast(result.error, "error");
    }
  }

  return (
    <div className="border-t border-border pt-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Home currency</span>
        <span className="text-sm font-medium">{homeCurrency || "MYR"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Home country</span>
        <select
          value={countryCode}
          onChange={(e) => handleSave(e.target.value)}
          disabled={saving}
          className="text-sm font-medium text-ink bg-ground border border-border rounded-md px-2 py-1 outline-none focus:border-accent transition-colors disabled:opacity-50"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
