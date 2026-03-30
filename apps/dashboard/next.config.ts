import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@cmd/db", "@cmd/auth", "@cmd/types", "@cmd/ui"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  // Standalone output for production: minimal node_modules, ready for Node/Docker
  output: "standalone",
};

export default nextConfig;
