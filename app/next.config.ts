import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The share-overlay image route reads fonts, logos and stamp art from disk
  // by path at runtime — make sure they ship with the deployed function.
  outputFileTracingIncludes: {
    "/api/trips/**": ["./src/assets/**/*", "./public/logo.png"],
  },
};

export default nextConfig;
