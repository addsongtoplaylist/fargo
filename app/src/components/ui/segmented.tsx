/** Segmented control: grey track, white raised thumb for the selected option. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className = "",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group, e.g. "Split as". */
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`flex bg-page rounded-field p-1 ${className}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`flex-1 h-9 rounded-[9px] text-[13px] font-semibold transition-colors ${
              on ? "bg-surface text-brand shadow-[0_1px_3px_rgba(23,32,51,0.12)]" : "text-fg-muted hover:text-fg"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
