import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
     remotePatterns: [
      {
        protocol: 'https',
        hostname: 'auqsgql36h.ufs.sh',
      },
    ],
 }
};

export default nextConfig;
