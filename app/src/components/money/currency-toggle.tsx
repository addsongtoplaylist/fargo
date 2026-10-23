"use client";

import { useSyncExternalStore } from "react";
import { ArrowLeftRight } from "lucide-react";

/**
 * One currency switch for all money amounts (owner, v0.6.5): trip currency or
 * MYR, remembered per trip on this device. Every money screen (Money, Your
 * expenses, Settle up, Schedule's daily budget) reads the same setting, so
 * flipping it in one place flips it everywhere. Display only — amounts are
 * still saved in both currencies. Replaces the "≈ RM" lines.
 */
const EVENT = "fargo-money-currency";
const key = (tripId: string) => `fargo_money_cur:${tripId}`;

function read(tripId: string): boolean {
  try {
    return localStorage.getItem(key(tripId)) === "home";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export type MoneyCurrency = {
  /** Currency code to show next to amounts */
  code: string;
  /** True when amounts are shown in MYR */
  home: boolean;
  /** False when the trip is already in MYR or has no rate — no switch shown */
  canSwitch: boolean;
  toggle: () => void;
  /** Trip-currency amount → shown amount */
  fromLocal: (local: number) => number;
  /** MYR amount → shown amount */
  fromMyr: (myr: number) => number;
  /** An expense-style pair (local + stored MYR) → shown amount */
  pick: (local: number, myr: number) => number;
};

export function useMoneyCurrency(tripId: string, localCurrency: string, fxRate: number): MoneyCurrency {
  const stored = useSyncExternalStore(subscribe, () => read(tripId), () => false);
  const canSwitch = !!localCurrency && localCurrency !== "MYR" && fxRate > 0;
  const home = stored && canSwitch;
  return {
    code: home ? "MYR" : localCurrency,
    home,
    canSwitch,
    toggle: () => {
      try {
        if (home) localStorage.removeItem(key(tripId));
        else localStorage.setItem(key(tripId), "home");
      } catch {
        // Storage blocked (private mode): nothing to remember
      }
      window.dispatchEvent(new Event(EVENT));
    },
    fromLocal: (local) => (home ? local / fxRate : local),
    fromMyr: (myr) => (home ? myr : myr * fxRate),
    pick: (local, myr) => (home ? myr : local),
  };
}

/** The pill: shows the current currency, tap to switch. */
export function CurrencyToggle({ money }: { money: MoneyCurrency }) {
  if (!money.canSwitch) return null;
  return (
    <button
      type="button"
      onClick={money.toggle}
      aria-label={`Amounts in ${money.code} — switch currency`}
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-brand-soft text-brand text-xs font-semibold hover:bg-brand hover:text-brand-on transition-colors"
    >
      {money.code}
      <ArrowLeftRight size={12} strokeWidth={2.2} aria-hidden />
    </button>
  );
}
