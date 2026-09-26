"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/account";
import { useToast } from "@/components/toast";
import {
  DINING_BUDGETS,
  DIETARY_OPTIONS,
  type DiningBudget,
} from "@/lib/dining";

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

type DiningPreferencesProps = {
  diningBudget: string;
  dietaryRestrictions: string[];
};

const selectClass =
  "text-sm font-medium text-ink bg-ground border border-border rounded-md px-2 py-1 outline-none focus:border-accent transition-colors disabled:opacity-50";

// Standard chip style (matches the category chips in Add activity)
const chipBase =
  "px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50";

const chipOff =
  `${chipBase} bg-ground text-muted border border-border hover:border-accent/40`;

const chipOn = `${chipBase} bg-accent text-accent-on`;

export function DiningPreferences({
  diningBudget: initialBudget,
  dietaryRestrictions: initialDietary,
}: DiningPreferencesProps) {
  const [budget, setBudget] = useState(initialBudget);
  const [dietary, setDietary] = useState<string[]>(initialDietary);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Saves instantly on every change (same as Home country); reverts on failure
  async function save(nextBudget: string, nextDietary: string[]) {
    const prevBudget = budget;
    const prevDietary = dietary;
    setBudget(nextBudget);
    setDietary(nextDietary);
    setSaving(true);
    const result = await updateProfile({
      dining_budget: nextBudget,
      dietary_restrictions: nextDietary,
    });
    setSaving(false);

    if (result.error) {
      setBudget(prevBudget);
      setDietary(prevDietary);
      toast(result.error, "error");
    }
  }

  function toggleDietary(value: string) {
    save(
      budget,
      dietary.includes(value) ? dietary.filter((d) => d !== value) : [...dietary, value]
    );
  }

  return (
    <div className="space-y-5">
      {/* Budget — single select dropdown */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Budget</span>
        <select
          value={budget}
          onChange={(e) => save(e.target.value, dietary)}
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

    </div>
  );
}
