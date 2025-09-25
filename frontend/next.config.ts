import { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Изменяем в зависимости от разработки

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: API_URL + "/:path*", 
      },
    ];
  },
};

export default nextConfig;
