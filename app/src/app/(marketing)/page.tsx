import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { Closing, FeatureCards, Galaxy, InstallAndFaq, Journey, PassportSection, Statement } from "@/components/marketing/sections";

export const metadata: Metadata = {
  title: "Fargo · Every trip starts here",
  description: "The trip planner for your whole group. Plan the days, share the plan with your buddies, and keep the costs fair.",
};

/**
 * Landing page v6 (LANDING.md → Redesign v6, BRAND.md voice). At / for signed-out visitors
 * (signed-in go to /trips); /home reuses it for anyone.
 */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Statement />
      <Galaxy />
      <FeatureCards />
      <Journey />
      <PassportSection />
      <InstallAndFaq />
      <Closing />
    </>
  );
}
