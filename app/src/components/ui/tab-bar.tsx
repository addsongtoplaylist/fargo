"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type TabItem = { href: string; label: string; icon: LucideIcon; active: boolean; badge?: number };

/** True while a text field has focus — the phone keyboard is likely open. */
function useTyping() {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) &&
      !(el instanceof HTMLInputElement && ["checkbox", "radio", "button", "submit", "range"].includes(el.type));
    const onIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);
  return typing;
}

/**
 * Floating bottom bar (DESIGN.md → Navigation). The caller decides which
 * item is active. Hidden while typing so it never sits on the keyboard.
 */
export function TabBar({ items, label }: { items: TabItem[]; label: string }) {
  const typing = useTyping();
  if (typing) return null;
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-[calc(22px+env(safe-area-inset-bottom))] z-50 px-3.5 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-[calc(var(--max-width-column)-28px)] h-[66px] px-2 flex items-center justify-around rounded-bar bg-surface/95 border border-line shadow-float backdrop-blur">
        {items.map(({ href, label: text, icon: Icon, active, badge }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={badge ? `${text}, ${badge} new` : undefined}
            className={`min-w-14 h-12 px-2.5 rounded-[14px] flex flex-col items-center justify-center gap-[3px] transition-colors ${
              active ? "bg-brand-soft text-brand" : "text-fg-muted hover:text-fg"
            }`}
          >
            <span className="relative">
              <Icon size={21} strokeWidth={active ? 2.1 : 1.9} aria-hidden />
              {!!badge && (
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-money-over text-white text-[10px] font-bold leading-[17px] text-center tabular-nums ring-2 ring-surface"
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>
            <span className={`text-[10px] leading-none ${active ? "font-semibold" : "font-medium"}`}>{text}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
