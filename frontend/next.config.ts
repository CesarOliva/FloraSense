import type { NextConfig } from "next";

function apiHostname() {
  try {
    return process.env.NEXT_PUBLIC_API_BASE_URL
      ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [apiHostname()].filter((host): host is string => Boolean(host)),
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
