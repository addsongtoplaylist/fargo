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
 * Floating bottom bar (DESIGN.md → Navigation; icons only since v0.6.0, Threads-style).
 * The caller decides which item is active; the active icon sits bolder on a soft pill.
 * Labels are read out by screen readers (aria-label), not shown. The bar is as wide as
 * its icons. Hidden while typing so it never sits on the keyboard.
 */
export function TabBar({ items, label }: { items: TabItem[]; label: string }) {
  const typing = useTyping();
  if (typing) return null;
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-[calc(22px+env(safe-area-inset-bottom))] z-50 px-3.5 pointer-events-none flex justify-center"
    >
      <div className="pointer-events-auto h-16 px-2 flex items-center gap-1.5 rounded-full bg-surface/95 border border-line shadow-float backdrop-blur">
        {items.map(({ href, label: text, icon: Icon, active, badge }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={badge ? `${text}, ${badge} new` : text}
            title={text}
            className={`w-14 h-12 rounded-full flex items-center justify-center transition-colors ${
              active ? "bg-brand-soft text-brand" : "text-fg-muted hover:text-fg"
            }`}
          >
            <span className="relative">
              <Icon size={23} strokeWidth={active ? 2.3 : 1.9} aria-hidden />
              {!!badge && (
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-money-over text-white text-[10px] font-bold leading-[17px] text-center tabular-nums ring-2 ring-surface"
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
