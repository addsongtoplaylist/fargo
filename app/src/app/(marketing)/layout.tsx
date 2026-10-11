import { IBM_Plex_Mono } from "next/font/google";
import { FloatingNav, SiteFooter } from "@/components/marketing/site-nav";

const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex", display: "swap" });

/**
 * Marketing pages: landing (/ signed out, /home for anyone), Privacy, Terms — white page, black ink
 * (LANDING.md → Redesign v6). The landing hero carries its own nav; Privacy / Terms use SolidNav.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${plex.variable} min-h-dvh flex flex-col bg-white text-[#0c0c0c]`}>
      <FloatingNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
