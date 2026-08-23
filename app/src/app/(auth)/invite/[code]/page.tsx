import { redirect } from "next/navigation";
import { getTripByInviteCode, joinTripByInviteCode } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { InviteLanding } from "./invite-landing";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const trip = await getTripByInviteCode(code);

  if (!trip) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-4 bg-ground">
        <div className="w-full max-w-[360px] text-center">
          <h1 className="text-2xl font-semibold text-ink mb-2">
            Invalid invite link
          </h1>
          <p className="text-sm text-muted mb-6">
            This invite link is expired or doesn't exist.
          </p>
          <a
            href="/sign-in"
            className="text-sm text-accent hover:underline"
          >
            Go to sign in
          </a>
        </div>
      </div>
    );
  }

  // If the user is already signed in, try to join automatically
  const account = await getOrCreateAccount();
  if (account) {
    const tripId = await joinTripByInviteCode(code);
    redirect(`/trips/${tripId}/overview`);
  }

  // Not signed in — show the invite landing page
  return <InviteLanding trip={trip} inviteCode={code} />;
}
