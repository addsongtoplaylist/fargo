import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/marketing/legal-placeholder";

export const metadata: Metadata = { title: "Privacy policy · Fargo" };

export default function PrivacyPage() {
  return <LegalPlaceholder title="Privacy policy" />;
}
