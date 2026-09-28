"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Bottom sheet (DESIGN.md → Sheets): dimmed backdrop, rounded top, grab
 * handle, title + close. Sits above the bottom bar (z-[70] > bar z-50).
 * Content scrolls inside; `footer` stays pinned at the bottom.
 */
export function Sheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <div className="absolute inset-0 bg-fg/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className="relative w-full max-w-[var(--max-width-column)] max-h-[92dvh] flex flex-col bg-surface rounded-t-sheet shadow-float animate-slide-up"
      >
        <div className="px-5 pt-2.5 shrink-0">
          <div className="w-[38px] h-[5px] rounded-full bg-line mx-auto mb-2.5" aria-hidden />
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <h2 className="text-lg font-bold text-fg truncate">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-page flex items-center justify-center text-fg shrink-0"
            >
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
        <div className="px-5 overflow-y-auto flex-1 min-h-0">{children}</div>
        {footer && (
          <div className="px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0">{footer}</div>
        )}
        {!footer && <div className="pb-[calc(1rem+env(safe-area-inset-bottom))]" />}
      </div>
    </div>
  );
}
