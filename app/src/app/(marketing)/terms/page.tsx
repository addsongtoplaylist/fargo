import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/marketing/legal-placeholder";

export const metadata: Metadata = { title: "Terms of use · Fargo" };

export default function TermsPage() {
  return <LegalPlaceholder title="Terms of use" />;
}
