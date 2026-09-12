import type { NextConfig } from "next";

/**
 * NEXT_PUBLIC_ALLOWED_DEV_ORIGINS env var allows setting comma-separated development origins
 * for Next.js dev server cross-origin requests (e.g. "10.195.129.227,localhost:3000").
 */
const allowedDevOrigins = process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS
  ? process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const nextConfig: NextConfig = {
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
