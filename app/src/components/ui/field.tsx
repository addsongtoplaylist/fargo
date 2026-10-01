/** Classes for inputs/selects/textareas (DESIGN.md → Fields). */
export const fieldClass =
  "w-full bg-page border border-line rounded-field px-3 h-11 text-sm text-fg placeholder:text-fg-faint outline-none focus:border-brand transition-colors";

export const textareaClass =
  "w-full bg-page border border-line rounded-field px-3 py-2.5 text-sm text-fg placeholder:text-fg-faint outline-none focus:border-brand transition-colors resize-none";

/** Short field with its label beside it (Add activity pattern). */
export function FieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor={htmlFor} className="text-[13px] text-fg-muted w-16 shrink-0">
        {label}
      </label>
      <div className="flex-1 min-w-0 flex items-center gap-2">{children}</div>
    </div>
  );
}

/** Stacked field: label above (New trip, Trip settings). */
export function FieldStack({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-fg-muted mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-fg-muted mt-1.5">{hint}</p>}
    </div>
  );
}
