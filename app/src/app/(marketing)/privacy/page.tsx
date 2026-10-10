import type { Metadata } from "next";
import { ContactLine, LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy policy · Fargo" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="10 October 2026"
      intro={
        <p>
          Fargo is a trip planner for you and your travel buddies. This page explains what Fargo keeps, why, and who
          can see it. The short version: a trip is only seen by the people on it, and we never sell your data or show
          you ads.
        </p>
      }
      sections={[
        {
          heading: "What Fargo keeps",
          body: (
            <ul>
              <li>
                <b>Your Google account basics</b>: your name, email address and profile photo, from Google sign-in.
                Fargo never sees your Google password.
              </li>
              <li>
                <b>Your preferences</b>: home currency, food budget and dietary needs, used to suggest places to eat.
              </li>
              <li>
                <b>Your trips</b>: dates, destinations, schedule, places, ideas, cover photos, the names of your travel
                buddies, the costs your group logs, and your own budget.
              </li>
              <li>
                <b>Your checklists</b>: only you can see them.
              </li>
              <li>
                <b>Visits to this website</b>: we count page views with Vercel Web Analytics. It uses no cookies and
                doesn&apos;t identify you.
              </li>
            </ul>
          ),
        },
        {
          heading: "Who can see your trips",
          body: (
            <ul>
              <li>A trip is only visible to the travellers on it. The planner edits the plan; everyone on the trip can see it.</li>
              <li>
                If a planner adds a buddy who hasn&apos;t joined Fargo, only that name is stored, so the group&apos;s
                shared costs add up.
              </li>
              <li>
                <b>Share links</b> show the plan only. They never include costs, budgets or email addresses.
              </li>
              <li>We don&apos;t sell your data, and we don&apos;t share it with advertisers.</li>
            </ul>
          ),
        },
        {
          heading: "Services Fargo uses",
          body: (
            <>
              <p>To run, Fargo relies on a few trusted services. They only get what they need to do their job:</p>
              <ul>
                <li><b>Supabase</b>: stores your account and trips, and handles sign-in.</li>
                <li><b>Vercel</b>: hosts the app and counts page views.</li>
                <li><b>Google</b>: sign-in, and place details when you search for somewhere to go or eat.</li>
                <li><b>Mapbox</b>: maps and destination search.</li>
                <li><b>Open-Meteo</b>: weather for your trip. It only receives the place and dates.</li>
              </ul>
              <p>These services may store data on servers outside Malaysia.</p>
            </>
          ),
        },
        {
          heading: "Keeping and deleting your data",
          body: (
            <ul>
              <li>We keep your data while you use Fargo.</li>
              <li>You can leave a trip at any time. A planner can delete a trip, which removes it for everyone on it.</li>
              <li>
                To delete your account, <ContactLine />. We&apos;ll delete it within 30 days. Costs you logged on a
                group trip stay with that trip so your buddies&apos; totals still add up.
              </li>
            </ul>
          ),
        },
        {
          heading: "Children",
          body: <p>Fargo is not meant for children under 13.</p>,
        },
        {
          heading: "Changes and contact",
          body: (
            <p>
              If this policy changes, we&apos;ll update the date at the top, and tell you in the app if the change is
              a big one. Questions about your data? <ContactLine />.
            </p>
          ),
        },
      ]}
    />
  );
}
