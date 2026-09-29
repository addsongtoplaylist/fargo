import Link from "next/link";
import { Link2Off } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import { buttonClasses } from "@/components/ui/button";
import { getTripByInviteCode } from "@/lib/actions/trip";
import { getOrCreateAccount } from "@/lib/account";
import { InviteLanding } from "./invite-landing";
import { InvitePreview } from "./invite-preview";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const trip = await getTripByInviteCode(code);

  if (!trip) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-page">
        <Empty
          size="page"
          icon={Link2Off}
          title="Invalid invite link"
          message="This invite link is expired or doesn't exist. Ask the planner for a new one."
          action={
            <Link href="/sign-in" className={buttonClasses("soft", "md")}>
              Go to sign in
            </Link>
          }
        />
      </div>
    );
  }

  // Signed-in user: show preview with "Join Trip" button
  const account = await getOrCreateAccount();
  if (account) {
    // Check if already a member
    const alreadyMember = trip.travellers?.some((t) => t.account_id === account.id);
    return (
      <InvitePreview
        trip={trip}
        inviteCode={code}
        alreadyMember={!!alreadyMember}
      />
    );
  }

  // Not signed in — show the invite landing page with Google sign-in
  return <InviteLanding trip={trip} inviteCode={code} />;
}
