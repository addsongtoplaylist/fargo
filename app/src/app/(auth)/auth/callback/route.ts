import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/trips";

  // Build the redirect base URL (Vercel uses x-forwarded-host)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const origin = isLocalEnv
    ? new URL(request.url).origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=no_code`);
  }

  // Use request/response cookie pattern (more reliable on Vercel than cookies())
  const redirectUrl = `${origin}${next}`;
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    return response;
  }

  // Exchange failed — include error details in URL
  const errorMsg = encodeURIComponent(error.message || "unknown");
  return NextResponse.redirect(
    `${origin}/sign-in?error=exchange_failed&message=${errorMsg}`
  );
}
