import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes that don't need auth
  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/sign-in") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/s/"); // shared trip view

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // If signed in and trying to access sign-in, redirect to trips
  if (user && request.nextUrl.pathname === "/sign-in") {
    const url = request.nextUrl.clone();
    url.pathname = "/trips";
    return NextResponse.redirect(url);
  }

  // Auto-land: if hitting /trips (without ?noauto), find active trip
  // and rewrite directly — avoids a server redirect roundtrip (~350ms)
  if (
    user &&
    request.nextUrl.pathname === "/trips" &&
    !request.nextUrl.searchParams.has("noauto")
  ) {
    // Look up account
    const { data: account } = await supabase
      .from("accounts")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (account) {
      const today = new Date().toISOString().split("T")[0];

      // Find trip IDs where user is a traveller
      const { data: memberships } = await supabase
        .from("travellers")
        .select("trip_id")
        .eq("account_id", account.id);

      if (memberships && memberships.length > 0) {
        const tripIds = memberships.map((m) => m.trip_id);

        // Find active trip (start_date <= today <= end_date)
        const { data: activeTrip } = await supabase
          .from("trips")
          .select("id")
          .in("id", tripIds)
          .lte("start_date", today)
          .gte("end_date", today)
          .limit(1)
          .single();

        if (activeTrip) {
          const url = request.nextUrl.clone();
          url.pathname = `/trips/${activeTrip.id}/schedule`;
          // Redirect instead of rewrite so the URL updates correctly
          const response = NextResponse.redirect(url);
          // Copy auth cookies to the redirect response
          supabaseResponse.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") {
              response.headers.append(key, value);
            }
          });
          return response;
        }
      }
    }
  }

  return supabaseResponse;
}
