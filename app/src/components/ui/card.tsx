/** White rounded card on the page background — no border, no shadow (DESIGN.md v0.8). */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`bg-surface rounded-card p-4 ${className}`}>{children}</div>;
}

/** Card heading row: title left, optional link/action right. */
export function CardHeader({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      {action}
    </div>
  );
}

/** Small caps label: FIXED / DAILY / SPLIT AS / DANGER ZONE. */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-semibold tracking-[0.6px] uppercase text-fg-muted ${className}`}>{children}</p>
  );
}
