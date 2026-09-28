import type { LucideIcon } from "lucide-react";

/**
 * v0.8 empty state: icon in a soft circle, optional title, one line of
 * guidance, optional action. `page` size for full screens (My trips, 404).
 */
export function Empty({
  icon: Icon,
  title,
  message,
  action,
  size = "section",
}: {
  icon: LucideIcon;
  title?: string;
  message: string;
  action?: React.ReactNode;
  size?: "section" | "page";
}) {
  const page = size === "page";
  return (
    <div className={`flex flex-col items-center text-center ${page ? "py-9 px-6" : "py-6 px-4"}`}>
      <div
        className={`rounded-full bg-brand-soft text-brand flex items-center justify-center ${page ? "w-16 h-16 mb-3.5" : "w-12 h-12 mb-3"}`}
      >
        <Icon size={page ? 28 : 22} strokeWidth={1.9} aria-hidden />
      </div>
      {title && <p className="text-[17px] font-semibold text-fg mb-1">{title}</p>}
      <p className="text-sm text-fg-muted max-w-[270px] leading-relaxed">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
