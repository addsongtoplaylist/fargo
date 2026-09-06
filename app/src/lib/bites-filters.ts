// Filter type definitions for Discover → Bites
// Separated from bites.ts (server actions) because "use server" files
// can only export async functions.

export const ALL_FOOD_TYPES = [
  "restaurant",
  "cafe",
  "bakery",
  "coffee_shop",
  "fast_food_restaurant",
  "meal_takeaway",
  "bar",
  "ice_cream_shop",
];

export type FilterType = {
  key: string;
  label: string;
  types: string[];
};

export const FILTER_TYPES: FilterType[] = [
  { key: "all", label: "All", types: ALL_FOOD_TYPES },
  { key: "cafe", label: "Cafe", types: ["cafe", "coffee_shop"] },
  { key: "restaurant", label: "Restaurant", types: ["restaurant"] },
  { key: "bakery", label: "Bakery", types: ["bakery"] },
  { key: "fast_food", label: "Fast Food", types: ["fast_food_restaurant"] },
  { key: "bar", label: "Bar", types: ["bar"] },
  { key: "japanese", label: "Japanese", types: ["japanese_restaurant", "sushi_restaurant", "ramen_restaurant"] },
  { key: "chinese", label: "Chinese", types: ["chinese_restaurant"] },
  { key: "korean", label: "Korean", types: ["korean_restaurant"] },
  { key: "thai", label: "Thai", types: ["thai_restaurant"] },
  { key: "indian", label: "Indian", types: ["indian_restaurant"] },
  { key: "italian", label: "Italian", types: ["italian_restaurant", "pizza_restaurant"] },
  { key: "seafood", label: "Seafood", types: ["seafood_restaurant"] },
];
