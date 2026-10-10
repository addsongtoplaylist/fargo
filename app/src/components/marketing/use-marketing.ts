"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * The landing page lives at / (signed out) and /home (anyone, linked from Profile).
 * Section links must stay on the page you're on: from /home, "/#faq" would hit /,
 * which sends signed-in people to /trips.
 */
export function useLandingBase() {
  const pathname = usePathname();
  return pathname === "/home" ? "/home" : "/";
}

/** True once we know there's a session (browser only; starts false so the server render matches). */
export function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setSignedIn(!!data.session));
  }, []);
  return signedIn;
}
