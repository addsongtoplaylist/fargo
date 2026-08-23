import { Column } from "@/components/column";
import { getOrCreateAccount } from "@/lib/account";
import { SignOutButton } from "@/components/sign-out-button";

export default async function ProfilePage() {
  const account = await getOrCreateAccount();

  return (
    <Column className="py-6">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="bg-card rounded-md border border-border p-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-accent font-semibold text-lg">
            {account?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-ink">{account?.name}</p>
            <p className="text-sm text-muted">{account?.email}</p>
          </div>
        </div>
        <div className="border-t border-border pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Home currency</span>
            <span className="text-sm font-medium">
              {account?.home_currency || "MYR"}
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-base font-semibold mt-8 mb-3">Recently viewed</h2>
      <p className="text-sm text-muted">
        Shared trips you&apos;ve viewed will appear here.
      </p>

      <SignOutButton />
    </Column>
  );
}
