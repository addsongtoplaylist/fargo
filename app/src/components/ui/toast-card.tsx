import { Check, Info, X } from "lucide-react";

export type ToastKind = "success" | "error" | "info";

const KIND = {
  success: { icon: Check, bg: "bg-money-ok" },
  error: { icon: X, bg: "bg-money-over" },
  info: { icon: Info, bg: "bg-brand" },
} as const;

/** v0.8 toast look: dark card, coloured round status icon, dismiss ×. P2 wires it into ToastProvider. */
export function ToastCard({ kind, message, onDismiss }: { kind: ToastKind; message: string; onDismiss?: () => void }) {
  const { icon: Icon, bg } = KIND[kind];
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className="flex items-center gap-2.5 bg-fg text-white rounded-2xl px-3.5 py-3 shadow-dialog animate-slide-down"
    >
      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
        <Icon size={14} strokeWidth={2.6} aria-hidden />
      </span>
      <p className="flex-1 text-sm">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="p-0.5 text-[#aeb6c4] hover:text-white">
          <X size={14} strokeWidth={2} aria-hidden />
        </button>
      )}
    </div>
  );
}
