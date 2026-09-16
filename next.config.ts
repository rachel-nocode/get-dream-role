import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  // Next 16 blocks HMR from 127.0.0.1 when the server bound to localhost.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
