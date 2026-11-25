import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ['gateway.pinata.cloud'],
  }
};

export default nextConfig;
