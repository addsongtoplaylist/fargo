"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/actions/account";
import { useToast } from "@/components/toast";
import {
  DINING_BUDGETS,
  DIETARY_OPTIONS,
  CUISINE_OPTIONS,
  type DiningBudget,
} from "@/db/schema";

const BUDGET_LABELS: Record<DiningBudget, string> = {
  any: "Any budget",
  budget: "$ Budget",
  moderate: "$$ Moderate",
  fine_dining: "$$$ Fine dining",
};

const DIETARY_LABELS: Record<string, string> = {
  halal: "Halal",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  gluten_free: "Gluten-free",
  nut_free: "Nut-free",
  dairy_free: "Dairy-free",
  pescatarian: "Pescatarian",
};

const CUISINE_LABELS: Record<string, string> = {
  local: "Local",
  japanese: "Japanese",
  chinese: "Chinese",
  korean: "Korean",
  thai: "Thai",
  indian: "Indian",
  italian: "Italian",
  mexican: "Mexican",
  middle_eastern: "Middle Eastern",
  american: "American",
  french: "French",
  vietnamese: "Vietnamese",
  seafood: "Seafood",
  cafe: "Cafe",
};

type DiningPreferencesProps = {
  diningBudget: string;
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
};

const selectClass =
  "text-sm font-medium text-ink bg-ground border border-border rounded-md px-2 py-1 outline-none focus:border-accent transition-colors disabled:opacity-50";

const chipBase =
  "px-3 py-1.5 text-sm rounded-full border transition-colors disabled:opacity-50";

const chipOff =
  `${chipBase} border-border text-muted hover:border-ink/30 hover:text-ink`;

const chipOn =
  `${chipBase} border-accent bg-accent-soft text-accent font-medium`;

export function DiningPreferences({
  diningBudget: initialBudget,
  dietaryRestrictions: initialDietary,
  cuisinePreferences: initialCuisine,
}: DiningPreferencesProps) {
  const [budget, setBudget] = useState(initialBudget);
  const [dietary, setDietary] = useState<string[]>(initialDietary);
  const [cuisine, setCuisine] = useState<string[]>(initialCuisine);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Track whether anything changed from the initial/saved state
  const [savedBudget, setSavedBudget] = useState(initialBudget);
  const [savedDietary, setSavedDietary] = useState<string[]>(initialDietary);
  const [savedCuisine, setSavedCuisine] = useState<string[]>(initialCuisine);

  const hasChanges =
    budget !== savedBudget ||
    JSON.stringify([...dietary].sort()) !== JSON.stringify([...savedDietary].sort()) ||
    JSON.stringify([...cuisine].sort()) !== JSON.stringify([...savedCuisine].sort());

  function toggleDietary(value: string) {
    setDietary((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  }

  function toggleCuisine(value: string) {
    setCuisine((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateProfile({
      dining_budget: budget,
      dietary_restrictions: dietary,
      cuisine_preferences: cuisine,
    } as Parameters<typeof updateProfile>[0]);
    setSaving(false);

    if (result.error) {
      toast(result.error, "error");
    } else {
      toast("Dining preferences saved", "success");
      setSavedBudget(budget);
      setSavedDietary([...dietary]);
      setSavedCuisine([...cuisine]);
    }
  }

  return (
    <div className="space-y-5">
      {/* Budget — single select dropdown */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Budget</span>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          disabled={saving}
          className={selectClass}
        >
          {DINING_BUDGETS.map((b) => (
            <option key={b} value={b}>
              {BUDGET_LABELS[b]}
            </option>
          ))}
        </select>
      </div>

      {/* Dietary — multi-select chips */}
      <div>
        <span className="text-sm text-muted">Dietary restrictions</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {DIETARY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => toggleDietary(d)}
              disabled={saving}
              className={dietary.includes(d) ? chipOn : chipOff}
            >
              {DIETARY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Cuisine — multi-select chips */}
      <div>
        <span className="text-sm text-muted">Cuisine preferences</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {CUISINE_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => toggleCuisine(c)}
              disabled={saving}
              className={cuisine.includes(c) ? chipOn : chipOff}
            >
              {CUISINE_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        className="w-full py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {saving ? "Saving…" : "Save preferences"}
      </button>
    </div>
  );
}
