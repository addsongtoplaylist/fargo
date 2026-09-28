import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type TabItem = { href: string; label: string; icon: LucideIcon; active: boolean };

/**
 * Floating bottom bar (DESIGN.md → Navigation). Presentational: the caller
 * decides which item is active. P2 wires it into the app and trip layouts.
 */
export function TabBar({ items, label }: { items: TabItem[]; label: string }) {
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-[calc(22px+env(safe-area-inset-bottom))] z-50 px-3.5 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-[calc(var(--max-width-column)-28px)] h-[66px] px-2 flex items-center justify-around rounded-bar bg-surface/95 border border-line shadow-float backdrop-blur">
        {items.map(({ href, label: text, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`min-w-14 h-12 px-2.5 rounded-[14px] flex flex-col items-center justify-center gap-[3px] transition-colors ${
              active ? "bg-brand-soft text-brand" : "text-fg-muted hover:text-fg"
            }`}
          >
            <Icon size={21} strokeWidth={active ? 2.1 : 1.9} aria-hidden />
            <span className={`text-[10px] leading-none ${active ? "font-semibold" : "font-medium"}`}>{text}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
