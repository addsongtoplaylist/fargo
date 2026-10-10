import type { NextConfig } from "next";

// Protective headers on every response (security review 2026-10-10).
const securityHeaders = [
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
