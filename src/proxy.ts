import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Proxy รันฝั่ง server ก่อนถึงหน้า /manage ทุกครั้ง
// ถ้ายังไม่เข้าสู่ระบบ ให้ส่งไปหน้า /login พร้อมจำหน้าที่ตั้งใจจะไป
export default auth((request) => {
  if (!request.auth) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/manage/:path*"],
};
