import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // อนุญาตรูปสินค้าจาก dummyjson และรูปโปรไฟล์จาก Google
    remotePatterns: [
      new URL("https://cdn.dummyjson.com/**"),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
};

export default nextConfig;
