"use server";

import { signIn, signOut } from "@/auth";

// รับเฉพาะ path ภายในเว็บ ป้องกันการส่ง callbackUrl ไปเว็บอื่น
function safeRedirect(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

export async function signInWithGoogle(formData: FormData) {
  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET ใน .env.local (ดูวิธีทำใน README.md) แล้วรีสตาร์ต npm run dev"
    );
  }
  await signIn("google", { redirectTo: safeRedirect(formData.get("callbackUrl")) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
