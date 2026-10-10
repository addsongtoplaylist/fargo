import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/logo-white.png";

/** Marketing footer (LANDING.md): frog + white wordmark, section links, legal. No contact line yet. */
export function MarketingFooter() {
  const link = "text-[#c9cfda] hover:text-white";
  return (
    <footer className="bg-fg text-[#c9cfda] pt-12 pb-8">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 flex flex-col gap-8">
        <div className="flex flex-wrap gap-x-16 gap-y-8">
          <div className="flex-[1_1_220px] flex flex-col gap-3">
            <span className="flex items-center gap-2.5">
              <Image src="/mascot.png" alt="" width={40} height={40} className="rounded-[10px]" />
              <Image src={logoWhite} alt="Fargo" height={26} className="w-auto" />
            </span>
            <span className="text-sm">Made for friends who travel together.</span>
          </div>
          <nav aria-label="Fargo" className="flex flex-col gap-2 text-sm">
            <b className="text-white">Fargo</b>
            <Link href="/#features" className={link}>Features</Link>
            <Link href="/#install" className={link}>Add to Home Screen</Link>
            <Link href="/#faq" className={link}>FAQ</Link>
          </nav>
          <nav aria-label="Account" className="flex flex-col gap-2 text-sm">
            <b className="text-white">Account</b>
            <Link href="/sign-in" className={link}>Sign in</Link>
            <Link href="/sign-in" className={link}>Start planning</Link>
          </nav>
          <nav aria-label="Legal" className="flex flex-col gap-2 text-sm">
            <b className="text-white">Legal</b>
            <Link href="/privacy" className={link}>Privacy</Link>
            <Link href="/terms" className={link}>Terms</Link>
          </nav>
        </div>
        <span className="text-[13px] text-fg-faint">© 2026 Fargo</span>
      </div>
    </footer>
  );
}
