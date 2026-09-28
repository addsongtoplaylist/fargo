/**
 * Initial avatar (DESIGN.md → Avatars).
 * - account: has signed in — brand-soft fill
 * - name-only: added by name / never joined — dashed outline
 * - selected: brand fill with a ring
 */
export function Avatar({
  name,
  kind = "account",
  selected = false,
  size = 44,
}: {
  name: string;
  kind?: "account" | "name-only";
  selected?: boolean;
  size?: number;
}) {
  const look = selected
    ? "bg-brand text-brand-on ring-2 ring-brand ring-offset-2 ring-offset-surface"
    : kind === "name-only"
      ? "bg-surface text-fg-muted border-[1.5px] border-dashed border-fg-faint"
      : "bg-brand-soft text-brand";
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 ${look}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

/** Overlapping row of small avatars (trip cards). Shows up to `max`, then "+N". */
export function AvatarStack({ names, size = 22, max = 5 }: { names: string[]; size?: number; max?: number }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="inline-flex items-center" aria-label={`${names.length} travellers`}>
      {shown.map((n, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-flex items-center justify-center rounded-full bg-brand-soft text-brand font-semibold border-2 border-surface"
          style={{ width: size, height: size, fontSize: Math.round(size * 0.4), marginLeft: i ? -7 : 0 }}
        >
          {n.trim().charAt(0).toUpperCase() || "?"}
        </span>
      ))}
      {extra > 0 && <span className="ml-1 text-[11px] text-fg-muted">+{extra}</span>}
    </span>
  );
}
