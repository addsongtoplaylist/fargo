import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";
const supabaseWs = supabase.replace(/^https:/, "wss:");

// Where the browser may load things from (REVIEW.md SEC-3). REPORT-ONLY for now:
// the browser only logs "[Report Only]" warnings in the console, nothing is blocked.
// Switch the header name to Content-Security-Policy once a release runs clean.
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js needs inline scripts without nonces (nonces would make every page dynamic)
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Cover photos (Supabase storage), Discover photos (Google), map images (Mapbox)
  `img-src 'self' data: blob: ${supabase} https://lh3.googleusercontent.com https://api.mapbox.com`,
  "font-src 'self' data:",
  // Supabase (data + sign-in), Mapbox (tiles, search, its usage pings). Google Places is server-only.
  `connect-src 'self' ${supabase} ${supabaseWs} https://api.mapbox.com https://events.mapbox.com${isDev ? " ws:" : ""}`,
  // Mapbox draws the map in a background worker created from a blob
  "worker-src 'self' blob:",
  "child-src blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
].join("; ");

// Protective headers on every response (security review 2026-10-10).
const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
  // No other site may show Fargo inside a frame (stops clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Browsers must trust the declared file type, never guess it.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Links to other sites only reveal fargotravel.vercel.app, never the page path (trip ids, share codes).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Switch off browser features Fargo doesn't use; location stays on for Discover ("near me").
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  // The share-overlay image route reads fonts, logos and stamp art from disk
  // by path at runtime — make sure they ship with the deployed function.
  outputFileTracingIncludes: {
    "/api/trips/**": ["./src/assets/**/*", "./public/logo.png"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
