import { ChevronRight, type LucideIcon } from "lucide-react";

/**
 * Profile row (redesign P8a, Airwallex-style): icon tile · label · value · chevron.
 * `children` can lay an invisible native control over the whole row (e.g. a select).
 */
export function ProfileRow({
  icon: Icon,
  label,
  value,
  chevron = false,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  label: string;
  value?: React.ReactNode;
  chevron?: boolean;
  tone?: "default" | "danger";
  children?: React.ReactNode;
}) {
  const danger = tone === "danger";
  return (
    <span className="relative flex items-center gap-3 min-h-[56px] px-4">
      <span
        className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 ${
          danger ? "bg-money-over-soft text-money-over" : "bg-page text-fg"
        }`}
      >
        <Icon size={18} strokeWidth={1.8} aria-hidden />
      </span>
      <span className={`flex-1 text-[15px] font-medium ${danger ? "text-money-over" : "text-fg"}`}>{label}</span>
      {value !== undefined && <span className="text-sm text-fg-muted truncate max-w-[45%] text-right">{value}</span>}
      {chevron && <ChevronRight size={16} className="text-fg-faint shrink-0" aria-hidden />}
      {children}
    </span>
  );
}

export const ROW_DIVIDER = "h-px bg-line ml-[62px]";
