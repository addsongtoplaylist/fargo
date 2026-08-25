"use client";

import { createContext, useContext } from "react";

type TripInput = {
  id: string;
  name: string;
  destination: string;
  destination_country?: string | null;
  destination_country_code?: string | null;
  destination_lat?: number | null;
  destination_lng?: number | null;
  start_date: string;
  end_date: string;
  trip_type: string;
  local_currency: string;
  fx_rate: string | number;
  status: string;
  planner_id: string;
  travellers?: { id: string; display_name: string; role: string; account_id: string }[];
  /** Current user's role on this trip — "planner" or "member" */
  myRole?: string;
};

type Trip = Omit<TripInput, "fx_rate"> & {
  /** Parsed to number at the context boundary — safe to use directly */
  fx_rate: number;
};

const TripContext = createContext<Trip | null>(null);

export function TripProvider({
  trip,
  children,
}: {
  trip: TripInput;
  children: React.ReactNode;
}) {
  // Parse fx_rate to number at the boundary so consumers don't need to
  const parsed: Trip = {
    ...trip,
    fx_rate: typeof trip.fx_rate === "number" ? trip.fx_rate : parseFloat(trip.fx_rate) || 1,
  };
  return <TripContext.Provider value={parsed}>{children}</TripContext.Provider>;
}

export function useTrip() {
  return useContext(TripContext);
}

/** Returns true if the current user is the planner */
export function useIsPlanner() {
  const trip = useTrip();
  return trip?.myRole === "planner";
}
