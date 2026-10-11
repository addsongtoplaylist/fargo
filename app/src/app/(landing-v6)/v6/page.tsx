import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/logo-white.png";
import { Closing, FeatureCards, Footer, Galaxy, InstallAndFaq, Journey, MONO, PassportSection, Statement } from "@/components/landing-v6/sections";
import { RevealWords } from "@/components/landing-v6/motion";

// Draft of the redesigned landing page — not linked anywhere, not indexed. Replaces / once approved.
export const metadata: Metadata = {
  title: "Fargo · Every trip starts here (draft)",
  robots: { index: false, follow: false },
};

/** Hero placeholder until the owner's video montage is ready: dark frame and the giant headline. */
function HeroPlaceholder() {
  return (
    <section className="h-svh sm:px-2 sm:pt-2">
      <div className="relative h-full sm:rounded-[20px] overflow-hidden bg-[#2b2f33] text-white">
        <span className={`${MONO} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-white/40`}>Video montage goes here</span>

        {/* Nav: full bar at the top (the floating pill version comes with the hero build) */}
        <nav className="absolute inset-x-0 top-0 flex items-center justify-between px-5 sm:px-8 py-6">
          <Image src={logoWhite} alt="Fargo" height={28} className="w-auto" priority />
          <div className="flex items-center gap-6 text-[15px]">
            <Link href="#features" className="hidden sm:inline text-white/85 hover:text-white">Features</Link>
            <Link href="#install" className="hidden sm:inline text-white/85 hover:text-white">Add to phone</Link>
            <Link href="#faq" className="hidden sm:inline text-white/85 hover:text-white">FAQ</Link>
            <Link href="/sign-in" className="rounded-[10px] bg-brand px-4 py-2 font-medium hover:bg-brand-hover">Start planning</Link>
          </div>
        </nav>

        <div className="absolute inset-x-0 bottom-0 px-5 sm:px-8 pb-6 flex items-end justify-between gap-6">
          <h1 className="text-[clamp(64px,14vw,200px)] leading-[0.8] font-bold tracking-[-0.06em]">
            <RevealWords lines={["Every trip", "starts here."]} />
          </h1>
        </div>
      </div>
    </section>
  );
}

export default function LandingV6() {
  return (
    <main>
      <HeroPlaceholder />
      <Statement />
      <Galaxy />
      <FeatureCards />
      <Journey />
      <PassportSection />
      <InstallAndFaq />
      <Closing />
      <Footer />
    </main>
  );
}
