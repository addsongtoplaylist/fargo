/** Placeholder legal page until the owner supplies the final text (LANDING.md). */
export function LegalPlaceholder({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-[720px] px-4 sm:px-6 py-16 flex flex-col gap-4">
      <h1 className="text-[30px] font-bold tracking-[-0.5px] text-fg">{title}</h1>
      <p className="text-[13px] font-semibold uppercase tracking-wide text-money-warn">Placeholder</p>
      <p className="text-[15px] leading-relaxed text-fg-muted">
        The final {title.toLowerCase()} is coming soon. Until then: Fargo only shows a trip to the people on it,
        share links show the plan but never the costs, and you sign in with Google, so Fargo never sees a password.
      </p>
    </section>
  );
}
