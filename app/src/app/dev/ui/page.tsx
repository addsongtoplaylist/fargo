import { notFound } from "next/navigation";
import { UiKit } from "./ui-kit";

/**
 * Redesign P1: preview-only page showing the v0.8 building blocks.
 * Never served in production; deleted in P9.
 */
export default function DevUiPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <UiKit />;
}
