import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: 'export',
  turbopack: {
    root: projectRoot,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
