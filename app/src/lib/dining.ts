// Dining preference constants — shared by the Profile UI and the DB schema.
// Kept out of db/schema.ts so browser code doesn't pull in drizzle-orm.

export const DINING_BUDGETS = ["any", "budget", "moderate", "fine_dining"] as const;
export type DiningBudget = (typeof DINING_BUDGETS)[number];

export const DIETARY_OPTIONS = [
  "halal",
  "vegetarian",
  "vegan",
  "gluten_free",
  "nut_free",
  "dairy_free",
  "pescatarian",
] as const;
export type DietaryOption = (typeof DIETARY_OPTIONS)[number];
