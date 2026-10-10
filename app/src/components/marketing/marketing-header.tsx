import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#install", label: "Add to phone" },
  { href: "/#faq", label: "FAQ" },
];

/** Marketing header (LANDING.md): frog + wordmark, section links, Sign in, Start planning. */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" aria-label="Fargo home" className="flex items-center gap-2.5 shrink-0">
          <Image src="/mascot.png" alt="" width={36} height={36} className="rounded-[10px]" priority />
          <Image src="/logo.png" alt="Fargo" width={74} height={28} priority />
        </Link>

        <nav aria-label="Main" className="hidden md:flex items-center gap-7 text-sm font-medium text-fg">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden md:inline-flex h-11 items-center px-2 text-sm font-semibold text-fg hover:text-brand">
            Sign in
          </Link>
          <Link href="/sign-in" className={buttonClasses("primary", "md")}>
            Start planning
          </Link>
          <details className="md:hidden relative">
            <summary
              aria-label="Open menu"
              className="list-none [&::-webkit-details-marker]:hidden w-11 h-11 rounded-xl border border-line flex items-center justify-center cursor-pointer"
            >
              <Menu size={20} aria-hidden />
            </summary>
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-surface border border-line shadow-lg p-2 flex flex-col">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="px-3 h-11 flex items-center rounded-xl text-[15px] hover:bg-page">
                  {l.label}
                </Link>
              ))}
              <Link href="/sign-in" className="px-3 h-11 flex items-center rounded-xl text-[15px] hover:bg-page">
                Sign in
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
