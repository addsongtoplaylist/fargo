import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms of use · Fargo" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="10 October 2026"
      intro={
        <p>
          These terms are the ground rules for using Fargo. By signing in, you agree to them. How we handle your data
          is in the{" "}
          <Link href="/privacy" className="font-semibold text-brand underline">
            privacy policy
          </Link>
          .
        </p>
      }
      sections={[
        {
          heading: "Using Fargo",
          body: (
            <ul>
              <li>Fargo is free to use. It&apos;s new, so features may change, move or be removed as we improve it.</li>
              <li>You need a Google account to sign in, and you must be at least 13.</li>
              <li>Keep your Google account secure. Anything done from your account is your responsibility.</li>
            </ul>
          ),
        },
        {
          heading: "Your trips are yours",
          body: (
            <ul>
              <li>
                What you add to Fargo stays yours. You let us store it and show it to the people on your trip (and to
                anyone you send a share link to) so the app works.
              </li>
              <li>
                You&apos;re responsible for what you add. Only add other people&apos;s details, like their names, if
                they&apos;re happy for you to.
              </li>
            </ul>
          ),
        },
        {
          heading: "Shared costs",
          body: (
            <p>
              Fargo helps your group keep track of who spent what, but it doesn&apos;t move money: settling up happens
              outside Fargo. Exchange rates are approximate, so double-check totals before you settle up.
            </p>
          ),
        },
        {
          heading: "Places, weather and suggestions",
          body: (
            <p>
              Place details, opening hours, maps and weather come from other services and can be wrong or out of date.
              Check anything important, like bookings and opening hours, before you go.
            </p>
          ),
        },
        {
          heading: "Fair use",
          body: (
            <p>
              Don&apos;t misuse Fargo: no breaking or overloading it, copying data in bulk, accessing trips that
              aren&apos;t yours, or using it for anything illegal. We may suspend accounts that do.
            </p>
          ),
        },
        {
          heading: "No guarantees",
          body: (
            <p>
              Fargo is provided as it is. We work hard to keep it running and your trips safe, but we can&apos;t promise
              it will always be available or error-free. As far as the law allows, we&apos;re not responsible for losses
              from using Fargo, such as a missed booking.
            </p>
          ),
        },
        {
          heading: "Stopping, changes and contact",
          body: (
            <ul>
              <li>You can stop using Fargo at any time. To delete your account, <ContactLine />.</li>
              <li>If these terms change, we&apos;ll update the date at the top and tell you in the app if it&apos;s a big change.</li>
              <li>These terms are governed by the laws of Malaysia.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
