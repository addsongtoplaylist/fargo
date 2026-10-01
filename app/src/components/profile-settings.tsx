"use client";

import { useState } from "react";
import { Globe, Banknote } from "lucide-react";
import { updateProfile } from "@/lib/actions/account";
import { useToast } from "@/components/toast";
import { COUNTRIES } from "@/lib/countries";
import { ProfileRow, ROW_DIVIDER } from "@/components/profile-row";

type ProfileSettingsProps = {
  homeCurrency: string;
  homeCountryCode: string | null;
};

/** TRAVEL rows: Home country (tap → native picker, saves instantly) · Home currency (read-only). */
export function ProfileSettings({ homeCurrency, homeCountryCode }: ProfileSettingsProps) {
  const [countryCode, setCountryCode] = useState(homeCountryCode ?? "MY");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleSave(code: string) {
    const prev = countryCode;
    setCountryCode(code);
    setSaving(true);
    const result = await updateProfile({ home_country_code: code });
    setSaving(false);
    if (result.error) {
      setCountryCode(prev);
      toast(result.error, "error");
    }
  }

  const country = COUNTRIES.find((c) => c.code === countryCode);

  return (
    <div className="bg-surface rounded-card">
      <ProfileRow icon={Globe} label="Home country" value={country?.name ?? countryCode} chevron>
        {/* Invisible select over the whole row — tapping opens the phone's picker */}
        <select
          aria-label="Home country"
          value={countryCode}
          onChange={(e) => handleSave(e.target.value)}
          disabled={saving}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </ProfileRow>
      <div className={ROW_DIVIDER} />
      <ProfileRow icon={Banknote} label="Home currency" value={homeCurrency || "MYR"} />
    </div>
  );
}
