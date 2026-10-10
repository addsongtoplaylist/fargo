import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { FeatureSwitcher } from "@/components/marketing/feature-switcher";
import { JourneyTimeline } from "@/components/marketing/journey-timeline";
import { AddActivitySteps } from "@/components/marketing/add-activity-steps";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { InstallSteps } from "@/components/marketing/install-steps";
import { Faq } from "@/components/marketing/faq";

export const metadata: Metadata = {
  title: "Fargo · Every trip starts here",
  description: "The trip planner for your whole group. Plan the days, share the plan with your buddies, and keep the costs fair.",
};

/** Landing page (LANDING.md v5 + reviews, BRAND.md voice). Signed-in visitors never see it — the middleware sends them to /trips. */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeatureSwitcher />
      <JourneyTimeline />
      <AddActivitySteps />
      <ClosingCta />
      <InstallSteps />
      <Faq />
    </>
  );
}
