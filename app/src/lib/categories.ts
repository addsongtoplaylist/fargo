/** Shared category definitions used across activity and expense panels */

export const ACTIVITY_CATEGORIES = [
  { value: "food", label: "🍜 Food" },
  { value: "transport", label: "🚕 Transport" },
  { value: "activities", label: "🏛 Activities" },
  { value: "shopping", label: "🛒 Shopping" },
  { value: "flights", label: "✈️ Flights" },
  { value: "accommodation", label: "🏨 Stay" },
  { value: "misc", label: "📦 Other" },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: "food", label: "🍜 Food" },
  { value: "transport", label: "🚕 Transport" },
  { value: "activities", label: "🏛 Activities" },
  { value: "shopping", label: "🛒 Shopping" },
  { value: "flights", label: "✈️ Flights" },
  { value: "accommodation", label: "🏨 Stay" },
  { value: "misc", label: "📦 Other" },
] as const;

export const CATEGORY_EMOJI: Record<string, string> = {
  flights: "✈️",
  accommodation: "🏨",
  food: "🍜",
  transport: "🚕",
  activities: "🏛",
  shopping: "🛒",
  misc: "📦",
  settlement: "🤝",
};

/** Label for a breakdown key — expense categories plus "settlement" (D27). */
export function categoryLabel(key: string): string {
  if (key === "settlement") return "Settle-ups";
  if (key === "accommodation") return "Stay";
  if (key === "misc") return "Other";
  return key.charAt(0).toUpperCase() + key.slice(1);
}
