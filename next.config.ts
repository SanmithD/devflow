import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/vi/**",
      },
    ],
  },
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
