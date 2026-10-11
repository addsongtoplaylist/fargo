import { IBM_Plex_Mono, Oswald } from "next/font/google";
import { FloatingNav, SiteFooter } from "@/components/marketing/site-nav";

const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex", display: "swap" });
// The Photo ticket's condensed place names (same font as the share image, v0.5.18)
const oswald = Oswald({ subsets: ["latin"], weight: ["500"], variable: "--font-oswald", display: "swap" });

/**
 * Marketing pages: landing (/ signed out, /home for anyone), Privacy, Terms — white page, black ink
 * (LANDING.md → Redesign v6). The landing hero carries its own nav; Privacy / Terms use SolidNav.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${plex.variable} ${oswald.variable} min-h-dvh flex flex-col bg-white text-[#0c0c0c]`}>
      <FloatingNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
