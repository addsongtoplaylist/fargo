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
  travellers?: { id: string; display_name: string; role: string }[];
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
