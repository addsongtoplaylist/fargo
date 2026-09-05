"use client";

import { useState } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  /** Use false for non-destructive confirmations (accent colour instead of red). Default true. */
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const label = confirmLabel ?? (destructive ? "Delete" : "Confirm");
  const btnClass = destructive
    ? "bg-red-500 hover:bg-red-600"
    : "bg-accent hover:bg-accent-hover";

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
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className={`bg-card rounded-lg border shadow-lg w-[calc(100%-2rem)] max-w-[320px] p-5 animate-slide-up ${
        destructive ? "border-border" : "border-accent/30"
      }`}>
        <h3 className={`text-base font-semibold mb-1 ${
          destructive ? "text-ink" : "text-accent"
        }`}>{title}</h3>
        <p className="text-sm text-muted mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 text-sm font-medium text-muted border border-border rounded-md hover:bg-ground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 h-10 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 ${btnClass}`}
          >
            {loading ? "Working…" : label}
          </button>
        </div>
      </div>
    </div>
  );
}
