import Link from "next/link";
import { House } from "lucide-react";

/** Round house button back to home (v0.7.0) — Passport and Profile, same look as the trip header's. */
export function HomeButton() {
  return (
    <Link
      href="/trips"
      aria-label="Back to home"
      className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-fg shrink-0 hover:border-fg-faint transition-colors"
    >
      <House size={19} strokeWidth={1.9} aria-hidden />
    </Link>
  );
}
