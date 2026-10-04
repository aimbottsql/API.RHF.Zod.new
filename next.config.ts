import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ตอน dev Next.js บล็อกไฟล์ JS ถ้าเปิดผ่าน IP (ลิงก์ "Network" เช่น http://172.18.224.1:3000)
  // ทำให้หน้าเว็บค้าง จึงอนุญาต IP วงแลน/WSL ไว้ (มีผลเฉพาะ npm run dev)
  // หมายเหตุ: Google login ใช้ได้เฉพาะ http://localhost:3000 เท่านั้น
  allowedDevOrigins: ["10.*.*.*", "172.*.*.*", "192.168.*.*"],
  images: {
    // อนุญาตรูปสินค้าจาก dummyjson และรูปโปรไฟล์จาก Google
    remotePatterns: [
      new URL("https://cdn.dummyjson.com/**"),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
};

export default nextConfig;
