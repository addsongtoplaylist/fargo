"use client";

import { createContext, useContext } from "react";

type Trip = {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  local_currency: string;
  fx_rate: string;
  status: string;
  planner_id: string;
  travellers?: { id: string; display_name: string; role: string; account_id: string }[];
  /** Current user's role on this trip — "planner" or "member" */
  myRole?: string;
};

const TripContext = createContext<Trip | null>(null);

export function TripProvider({
  trip,
  children,
}: {
  trip: Trip;
  children: React.ReactNode;
}) {
  return <TripContext.Provider value={trip}>{children}</TripContext.Provider>;
}

export function useTrip() {
  return useContext(TripContext);
}

/** Returns true if the current user is the planner */
export function useIsPlanner() {
  const trip = useTrip();
  return trip?.myRole === "planner";
}
