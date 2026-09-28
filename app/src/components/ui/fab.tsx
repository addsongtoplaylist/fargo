import Link from "next/link";
import { Plus } from "lucide-react";

/** Sits just above the floating tab bar (bar: 22px from bottom + 66px tall). */
const POSITION =
  "fixed right-5 bottom-[calc(104px+env(safe-area-inset-bottom))] z-40 w-14 h-14 rounded-full bg-brand text-brand-on shadow-fab flex items-center justify-center hover:bg-brand-hover transition-colors";

/** Floating + for the screen's main add action. Pass `href` or `onClick`. */
export function Fab({ label, href, onClick }: { label: string; href?: string; onClick?: () => void }) {
  const icon = <Plus size={24} strokeWidth={2.3} aria-hidden />;
  if (href) {
    return (
      <Link href={href} aria-label={label} className={POSITION}>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} className={POSITION}>
      {icon}
    </button>
  );
}
