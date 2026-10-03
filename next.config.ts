import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Supabase storage images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  // Environment validation at build time (optional, not blocking)
  // We use zod validation in src/lib/validation.ts at runtime instead
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  // For preview environment (Arena)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
