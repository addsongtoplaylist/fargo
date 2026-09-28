import {
  ArrowRightLeft,
  BedDouble,
  Car,
  Landmark,
  Package,
  Plane,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from "lucide-react";

/**
 * Redesign v0.8: each category gets a Lucide icon and a soft/strong colour
 * pair (DESIGN.md → Category colours). Replaces CATEGORY_EMOJI in the UI.
 * Keys match the stored category values (activities + expenses + settlement).
 */
export type CategoryStyle = { icon: LucideIcon; soft: string; strong: string; label: string };

export const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  accommodation: { icon: BedDouble, soft: "bg-cat-stay-soft", strong: "text-cat-stay", label: "Stay" },
  food: { icon: Utensils, soft: "bg-cat-food-soft", strong: "text-cat-food", label: "Food" },
  transport: { icon: Car, soft: "bg-cat-transport-soft", strong: "text-cat-transport", label: "Transport" },
  activities: { icon: Landmark, soft: "bg-cat-activities-soft", strong: "text-cat-activities", label: "Activities" },
  shopping: { icon: ShoppingBag, soft: "bg-cat-shopping-soft", strong: "text-cat-shopping", label: "Shopping" },
  flights: { icon: Plane, soft: "bg-cat-flights-soft", strong: "text-cat-flights", label: "Flights" },
  misc: { icon: Package, soft: "bg-cat-misc-soft", strong: "text-cat-misc", label: "Other" },
  settlement: { icon: ArrowRightLeft, soft: "bg-money-ok-soft", strong: "text-money-ok", label: "Settle-ups" },
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLE[category] ?? CATEGORY_STYLE.misc;
}
