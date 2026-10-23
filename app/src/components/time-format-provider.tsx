"use client";

import { createContext, useContext } from "react";
import type { TimeFormat } from "@/lib/time-format";

const TimeFormatContext = createContext<TimeFormat>("24h");

/** Gives client components the device's time format (read from the cookie by the root layout). */
export function TimeFormatProvider({ value, children }: { value: TimeFormat; children: React.ReactNode }) {
  return <TimeFormatContext.Provider value={value}>{children}</TimeFormatContext.Provider>;
}

export function useTimeFormat(): TimeFormat {
  return useContext(TimeFormatContext);
}
