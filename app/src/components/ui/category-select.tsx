import { CategoryIcon } from "@/components/ui/category-icon";
import { FieldRow, fieldClass } from "@/components/ui/field";
import { categoryStyle } from "@/lib/category-style";

/**
 * Category as a dropdown (owner, 2026-09-29 — replaces the chip rows on
 * Add activity and Log expense). The coloured icon beside it follows the
 * choice; the phone's own list shows the names.
 */
export function CategorySelect({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string;
  options: readonly { value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <FieldRow label="Category" htmlFor={id}>
      <CategoryIcon category={value} size={36} />
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${fieldClass} flex-1 min-w-0`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {categoryStyle(o.value).label}
          </option>
        ))}
      </select>
    </FieldRow>
  );
}
