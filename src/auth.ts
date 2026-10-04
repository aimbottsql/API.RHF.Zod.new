import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// ไฟล์นี้รันฝั่ง server เท่านั้น
// Auth.js อ่าน AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET จาก .env.local ให้อัตโนมัติ
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
});
