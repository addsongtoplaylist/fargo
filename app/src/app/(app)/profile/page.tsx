import { Column } from "@/components/column";
import { getOrCreateAccount } from "@/lib/account";
import { SignOutButton } from "@/components/sign-out-button";
import { ProfileSettings } from "@/components/profile-settings";
import { DiningPreferences } from "@/components/dining-preferences";
import { Eyebrow } from "@/components/ui/card";
import pkg from "../../../../package.json";

export default async function ProfilePage() {
  const account = await getOrCreateAccount();

  return (
    <Column className="pt-12 pb-8">
      {/* Who you are */}
      <div className="flex flex-col items-center text-center">
        <div className="w-[76px] h-[76px] rounded-full bg-brand-soft flex items-center justify-center text-brand font-bold text-[30px]">
          {account?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <h1 className="text-xl font-bold text-fg mt-3">{account?.name}</h1>
        <p className="text-[13px] text-fg-muted mt-0.5">{account?.email}</p>
      </div>

      <Eyebrow className="mx-1 mt-7 mb-2">Travel</Eyebrow>
      <ProfileSettings
        homeCurrency={account?.home_currency || "MYR"}
        homeCountryCode={account?.home_country_code ?? null}
      />

      <Eyebrow className="mx-1 mt-6 mb-2">Dining · used by Discover</Eyebrow>
      <DiningPreferences
        diningBudget={account?.dining_budget || "moderate"}
        dietaryRestrictions={account?.dietary_restrictions || []}
      />

      {/* "Recently viewed" hidden until it's built (Tier 3 decision) */}

      <div className="mt-6">
        <SignOutButton />
      </div>

      <p className="text-center text-[11px] text-fg-faint mt-5">Fargo v{pkg.version}</p>
    </Column>
  );
}
