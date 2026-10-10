import Image from "next/image";
import { ImageIcon, PencilLine } from "lucide-react";

/**
 * Placeholder frames for the landing page (LANDING.md → Photos and illustrations).
 * Pass `src` once the real screenshot / photo exists (batch 3); until then a labelled block shows.
 */

export function PhoneFrame({
  label,
  src,
  className = "",
  priority = false,
}: {
  label: string;
  src?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`w-[280px] h-[580px] shrink-0 rounded-[40px] bg-fg p-2 shadow-[0_24px_48px_rgba(23,32,51,0.18)] ${className}`}>
      <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-page">
        {src ? (
          <Image src={src} alt={label} fill sizes="264px" className="object-cover object-top" priority={priority} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 px-6 text-center text-fg-muted">
            <ImageIcon size={22} aria-hidden />
            <span className="text-[13px] font-semibold">Screenshot: {label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PhotoFrame({
  label,
  src,
  className = "",
  plain = false,
  children,
}: {
  label: string;
  src?: string;
  className?: string;
  /** No photo yet: show the background colour from className instead of a labelled placeholder. */
  plain?: boolean;
  children?: React.ReactNode;
}) {
  return (
    // Callers may position it absolutely; otherwise it's a positioned box so the caption can sit inside.
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative"} overflow-hidden ${plain ? "" : "bg-[#c5cfda]"} ${className}`}>
      {src ? (
        <Image src={src} alt={label} fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
      ) : plain ? null : (
        <span className="absolute left-3 top-3 z-[1] inline-flex items-center gap-2 rounded-[10px] bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-[#3b4556]">
          <ImageIcon size={16} aria-hidden />
          Photo: {label}
        </span>
      )}
      {children && <div className="relative z-[1]">{children}</div>}
    </div>
  );
}

export function IllustrationFrame({ label }: { label: string }) {
  return (
    <div className="h-[150px] rounded-[14px] border-2 border-dashed border-[#9db8d0] bg-brand-soft flex items-center justify-center gap-2 px-3 text-center text-xs font-semibold text-[#0b5c94]">
      <PencilLine size={18} aria-hidden className="shrink-0" />
      Illustration: {label}
    </div>
  );
}
