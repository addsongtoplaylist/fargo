"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/account";
import { useToast } from "@/components/toast";
import { Wallet, Leaf } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { ProfileRow, ROW_DIVIDER } from "@/components/profile-row";
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

export function DiningPreferences({
  diningBudget: initialBudget,
  dietaryRestrictions: initialDietary,
}: DiningPreferencesProps) {
  const [budget, setBudget] = useState(initialBudget);
  const [dietary, setDietary] = useState<string[]>(initialDietary);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
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

  const dietaryValue =
    dietary.length === 0
      ? "None"
      : dietary.length <= 2
        ? dietary.map((d) => DIETARY_LABELS[d] ?? d).join(", ")
        : `${DIETARY_LABELS[dietary[0]] ?? dietary[0]} +${dietary.length - 1}`;

  return (
    <>
      <div className="bg-surface rounded-card">
        <button type="button" onClick={() => setOpen(true)} className="w-full text-left">
          <ProfileRow icon={Wallet} label="Budget" value={BUDGET_LABELS[budget as DiningBudget] ?? budget} chevron />
        </button>
        <div className={ROW_DIVIDER} />
        <button type="button" onClick={() => setOpen(true)} className="w-full text-left">
          <ProfileRow icon={Leaf} label="Dietary" value={dietaryValue} chevron />
        </button>
      </div>

      <Sheet
        open={open}
        title="Dining preferences"
        onClose={() => setOpen(false)}
        footer={
          <Button size="lg" full onClick={() => setOpen(false)}>
            Done
          </Button>
        }
      >
        <p className="text-[13px] text-fg-muted mb-4">Used by Discover to filter spots by your budget and dietary needs.</p>
        <Eyebrow className="mb-2">Budget · pick one</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {DINING_BUDGETS.map((b) => (
            <Chip key={b} selected={budget === b} disabled={saving} onClick={() => save(b, dietary)}>
              {BUDGET_LABELS[b]}
            </Chip>
          ))}
        </div>
        <Eyebrow className="mt-5 mb-2">Dietary · pick any</Eyebrow>
        <div className="flex flex-wrap gap-2 pb-1">
          {DIETARY_OPTIONS.map((d) => (
            <Chip key={d} selected={dietary.includes(d)} disabled={saving} onClick={() => toggleDietary(d)}>
              {DIETARY_LABELS[d]}
            </Chip>
          ))}
        </div>
      </Sheet>
    </>
  );
}
