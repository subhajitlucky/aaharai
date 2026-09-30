import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows the Playwright dev server (PLAYWRIGHT_BASE_URL defaults to
  // 127.0.0.1) to load HMR resources instead of being blocked as cross-origin.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
