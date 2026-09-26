import type { LucideIcon } from "lucide-react";

/**
 * Compact empty state for sections inside a tab:
 * generic icon in a soft circle + one line of guidance.
 */
export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center mb-2">
        <Icon size={18} className="text-accent" />
      </div>
      <p className="text-sm text-muted max-w-[280px]">{message}</p>
    </div>
  );
}
