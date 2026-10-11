import { IBM_Plex_Mono } from "next/font/google";

const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex", display: "swap" });

/** Landing page v6 draft (LANDING.md → Redesign v6): its own white page, nav and footer. */
export default function LandingV6Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${plex.variable} min-h-dvh bg-white text-[#0c0c0c]`}>{children}</div>;
}
