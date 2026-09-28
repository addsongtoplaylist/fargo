"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev: the worker's cache-first rule serves stale CSS/JS (dev chunk
    // names don't change), so never run it locally — and remove old ones.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()));
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SW registered, scope:", reg.scope);
      })
      .catch((err) => {
        console.log("SW registration failed:", err);
      });
  }, []);

  return null;
}
