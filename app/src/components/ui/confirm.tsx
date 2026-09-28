"use client";

import { useState } from "react";

/**
 * Confirm dialog, v0.8 look. Same props as components/confirm-dialog.tsx so
 * screens can switch without other changes (P2 swaps the old one over).
 */
export function Confirm({
  open,
  title,
  message,
  confirmLabel,
  destructive = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const label = confirmLabel ?? (destructive ? "Delete" : "Confirm");

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-fg/40 px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div role="alertdialog" aria-modal="true" aria-label={title} className="bg-surface rounded-[22px] shadow-dialog w-full max-w-[320px] p-[22px]">
        <h2 className="text-lg font-bold text-fg mb-2">{title}</h2>
        <p className="text-sm text-fg-muted leading-relaxed">{message}</p>
        <div className="flex gap-2.5 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-11 rounded-full border border-line bg-surface text-sm font-semibold text-fg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 h-11 rounded-full text-sm font-semibold text-white disabled:opacity-50 ${
              destructive ? "bg-money-over" : "bg-brand hover:bg-brand-hover"
            }`}
          >
            {loading ? "Working…" : label}
          </button>
        </div>
      </div>
    </div>
  );
}
