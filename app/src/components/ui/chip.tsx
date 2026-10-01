import type { LucideIcon } from "lucide-react";

/**
 * One chip style everywhere (categories, filters, dietary, trip type,
 * Discover sections). `selected` = on; pass `aria-pressed` semantics.
 */
export function Chip({
  selected = false,
  icon: Icon,
  iconClassName = "",
  trailing,
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  icon?: LucideIcon;
  /** Colour for the icon when off (e.g. category colour). */
  iconClassName?: string;
  trailing?: React.ReactNode;
}) {
  const state = selected
    ? "bg-brand-soft text-brand border-brand"
    : "bg-surface text-fg border-line hover:border-fg-faint";
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`h-[34px] px-3 inline-flex items-center gap-1.5 shrink-0 rounded-full border text-[13px] font-medium transition-colors disabled:opacity-55 disabled:cursor-not-allowed ${state} ${className}`}
      {...props}
    >
      {Icon && <Icon size={14} strokeWidth={2} aria-hidden className={selected ? "text-brand" : iconClassName} />}
      {children}
      {trailing}
    </button>
  );
}
