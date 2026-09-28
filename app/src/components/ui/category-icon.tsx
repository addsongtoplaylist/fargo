import { categoryStyle } from "@/lib/category-style";

/** Soft circle with the category's Lucide icon (replaces category emoji). */
export function CategoryIcon({ category, size = 36 }: { category: string; size?: number }) {
  const { icon: Icon, soft, strong, label } = categoryStyle(category);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${soft} ${strong}`}
      style={{ width: size, height: size }}
      title={label}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={1.9} aria-hidden />
    </span>
  );
}
