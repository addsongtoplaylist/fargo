"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Banknote, Clock } from "lucide-react";
import { updateProfile } from "@/lib/actions/account";
import { useToast } from "@/components/toast";
import { COUNTRIES } from "@/lib/countries";
import { ProfileRow, ROW_DIVIDER } from "@/components/profile-row";
import { useTimeFormat } from "@/components/time-format-provider";
import { TIME_FORMAT_COOKIE, type TimeFormat } from "@/lib/time-format";

type ProfileSettingsProps = {
  homeCurrency: string;
  homeCountryCode: string | null;
};

/**
 * TRAVEL rows: Home country (tap → native picker, saves instantly) · Home currency (read-only)
 * · Time format (24-hour / 12-hour, saved on this device only).
 */
export function ProfileSettings({ homeCurrency, homeCountryCode }: ProfileSettingsProps) {
  const [countryCode, setCountryCode] = useState(homeCountryCode ?? "MY");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(useTimeFormat());

  function handleTimeFormat(value: TimeFormat) {
    setTimeFormat(value);
    document.cookie = `${TIME_FORMAT_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

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
      <div className={ROW_DIVIDER} />
      <ProfileRow icon={Clock} label="Time format" value={timeFormat === "12h" ? "12-hour" : "24-hour"} chevron>
        <select
          aria-label="Time format"
          value={timeFormat}
          onChange={(e) => handleTimeFormat(e.target.value as TimeFormat)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          <option value="24h">24-hour (19:00)</option>
          <option value="12h">12-hour (7:00 PM)</option>
        </select>
      </ProfileRow>
    </div>
  );
}
