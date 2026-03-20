import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cmd/db", "@cmd/auth", "@cmd/types", "@cmd/ui"],
};

export default nextConfig;
