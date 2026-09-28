import type { LucideIcon } from "lucide-react";

export type ButtonVariant = "primary" | "soft" | "quiet" | "danger" | "danger-outline";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-on hover:bg-brand-hover",
  soft: "bg-brand-soft text-brand hover:bg-brand hover:text-brand-on",
  quiet: "bg-surface text-fg border border-line hover:border-fg-faint",
  danger: "bg-money-over text-white hover:opacity-90",
  "danger-outline": "bg-surface text-money-over border border-money-over/40 hover:bg-money-over-soft",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-4 text-sm",
  lg: "h-[50px] px-5 text-[15px]",
};

/** Pill button classes — also used for Links styled as buttons. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", full = false) {
  return `inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${VARIANT[variant]} ${SIZE[size]} ${full ? "w-full" : ""}`;
}

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  icon: Icon,
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <button type="button" className={`${buttonClasses(variant, size, full)} ${className}`} {...props}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.2} aria-hidden />}
      {children}
    </button>
  );
}

/** Text-only action in panels ("Remove", "Delete", "Move to ideas"). */
export function TextButton({
  tone = "brand",
  icon: Icon,
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "brand" | "muted" | "danger"; icon?: LucideIcon }) {
  const colour = tone === "danger" ? "text-money-over" : tone === "muted" ? "text-fg-muted hover:text-fg" : "text-brand hover:text-brand-hover";
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 text-[13px] font-medium py-1.5 disabled:opacity-50 ${colour} ${className}`}
      {...props}
    >
      {Icon && <Icon size={14} strokeWidth={2} aria-hidden />}
      {children}
    </button>
  );
}
