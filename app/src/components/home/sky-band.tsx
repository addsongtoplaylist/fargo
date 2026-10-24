import Link from "next/link";
import { Plus, Compass, Stamp } from "lucide-react";
import { Column } from "@/components/column";

/**
 * Top of the home screen (v0.7.0): a brand-blue sky with soft clouds and a
 * dotted flight path, holding the greeting, your avatar (→ Profile), the
 * trip card(s) and three shortcuts. The sheet below overlaps its bottom edge.
 */
export function SkyBand({
  firstName,
  initial,
  stampsToCollect = 0,
  children,
}: {
  firstName: string;
  initial: string;
  /** Badge on Passport — trips that ended with a stamp waiting */
  stampsToCollect?: number;
  children?: React.ReactNode;
}) {
  const shortcuts = [
    { href: "/trips/new", label: "New trip", icon: Plus, badge: 0 },
    { href: "/discover", label: "Discover", icon: Compass, badge: 0 },
    { href: "/passport", label: "Passport", icon: Stamp, badge: stampsToCollect },
  ];
  return (
    <div className="relative bg-brand overflow-hidden pt-[calc(1rem+env(safe-area-inset-top))] pb-12">
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 520"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="330" cy="70" r="34" fill="#fff" opacity="0.14" />
        <ellipse cx="70" cy="150" rx="70" ry="16" fill="#fff" opacity="0.1" />
        <ellipse cx="300" cy="300" rx="90" ry="18" fill="#fff" opacity="0.08" />
        <ellipse cx="120" cy="430" rx="80" ry="15" fill="#fff" opacity="0.08" />
        <path d="M-10 120 C 90 60, 200 150, 300 70" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="5 7" opacity="0.25" />
      </svg>

      <Column className="relative">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[24px] font-bold text-white tracking-[-0.3px]">Hi {firstName}</h1>
          <Link
            href="/profile"
            aria-label="Profile"
            className="w-10 h-10 rounded-full bg-white text-brand font-bold text-[16px] flex items-center justify-center"
          >
            {initial}
          </Link>
        </div>

        {children}

        <nav aria-label="Shortcuts" className={`flex ${children ? "mt-5" : "mt-1"}`}>
          {shortcuts.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={label}
              href={href}
              aria-label={badge > 0 ? `${label}, ${badge} ${badge === 1 ? "stamp" : "stamps"} to collect` : undefined}
              className="flex-1 flex flex-col items-center gap-1.5 text-[12px] font-medium text-white"
            >
              <span className="relative w-12 h-12 rounded-full bg-white text-brand flex items-center justify-center">
                <Icon size={22} strokeWidth={2} aria-hidden />
                {badge > 0 && (
                  <span
                    aria-hidden
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-money-over text-white text-[11px] font-bold leading-5 text-center ring-2 ring-brand"
                  >
                    {badge}
                  </span>
                )}
              </span>
              {label}
            </Link>
          ))}
        </nav>
      </Column>
    </div>
  );
}
