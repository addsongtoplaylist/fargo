import { Column } from "@/components/column";
import { HomeButton } from "@/components/home-button";
import { getOrCreateAccount } from "@/lib/account";
import { SignOutButton } from "@/components/sign-out-button";
import { InstallRow } from "@/components/install-row";
import { ProfileSettings } from "@/components/profile-settings";
import { DiningPreferences } from "@/components/dining-preferences";
import Link from "next/link";
import { Info, ListChecks } from "lucide-react";
import { ProfileRow, ROW_DIVIDER } from "@/components/profile-row";
import { getMyDefaultChecklists } from "@/lib/actions/checklist";
import pkg from "../../../../package.json";

export default async function ProfilePage() {
  const [account, defaultLists] = await Promise.all([getOrCreateAccount(), getMyDefaultChecklists()]);

  return (
    <Column className="pt-4 pb-8">
      <HomeButton />
      {/* Who you are */}
      <div className="flex flex-col items-center text-center">
        <div className="w-[76px] h-[76px] rounded-full bg-brand-soft flex items-center justify-center text-brand font-bold text-[30px]">
          {account?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <h1 className="text-xl font-bold text-fg mt-3">{account?.name}</h1>
        <p className="text-[13px] text-fg-muted mt-0.5">{account?.email}</p>
      </div>

      {/* Three untitled groups (owner, v0.6.5): you & time · planning & dining · about & sign out */}
      <div className="mt-7" />
      <ProfileSettings
        homeCurrency={account?.home_currency || "MYR"}
        homeCountryCode={account?.home_country_code ?? null}
      />

      <div className="mt-4 bg-surface rounded-card">
        <Link href="/profile/checklists" className="block">
          <ProfileRow
            icon={ListChecks}
            label="My checklists"
            value={defaultLists.length > 0 ? `${defaultLists.length} default ${defaultLists.length === 1 ? "list" : "lists"}` : "Set up"}
            chevron
          />
        </Link>
        <div className={ROW_DIVIDER} />
        {/* Dining budget + dietary, used by Discover */}
        <DiningPreferences
          diningBudget={account?.dining_budget || "moderate"}
          dietaryRestrictions={account?.dietary_restrictions || []}
        />
      </div>

      {/* "Recently viewed" hidden until it's built (Tier 3 decision) */}

      <div className="mt-4 bg-surface rounded-card">
        <InstallRow />
        <Link href="/home" className="block">
          <ProfileRow icon={Info} label="About Fargo" chevron />
        </Link>
        <div className={ROW_DIVIDER} />
        <SignOutButton />
      </div>

      <p className="text-center text-[11px] text-fg-faint mt-5">Fargo v{pkg.version}</p>
    </Column>
  );
}
