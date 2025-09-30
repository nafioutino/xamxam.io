import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  // Configuration pour les uploads de fichiers
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Augmenter la limite pour les vidéos TikTok
    },
  },
};

export default nextConfig;
