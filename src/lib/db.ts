import { Pool } from "pg";

// Connection pool ของ PostgreSQL ใช้ร่วมกันทั้งแอป (รันฝั่ง server เท่านั้น)
// เก็บไว้ใน globalThis เพื่อไม่ให้สร้าง pool ใหม่ทุกครั้งที่ hot reload ตอน dev
const globalForDb = globalThis as unknown as { pool?: Pool };

export function db(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("ยังไม่ได้ตั้งค่า DATABASE_URL ใน .env.local (ดูวิธีทำใน README.md)");
  }
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    // ถ้าฐานข้อมูลปิดไประหว่างใช้งาน ไม่ให้ server ล่มทั้งตัว
    globalForDb.pool.on("error", (error) => console.error(`[db] ${error.message}`));
  }
  return globalForDb.pool;
}

// แปลง error จากฐานข้อมูลเป็นข้อความที่บอกวิธีแก้
export function explainDbError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case "ECONNREFUSED":
      return "เชื่อมต่อฐานข้อมูลไม่ได้ — ยังไม่ได้เปิดฐานข้อมูล ให้ปิดแล้วรัน npm run dev ใหม่ (คำสั่งนี้เปิดฐานข้อมูลให้อัตโนมัติ)";
    case "3D000":
      return "ไม่พบฐานข้อมูล — รัน npm run db:setup";
    case "42P01":
      return "ยังไม่ได้สร้างตาราง products — รัน npm run db:setup";
    case "28P01":
      return "รหัสผ่านฐานข้อมูลไม่ถูกต้อง — ตรวจสอบ DATABASE_URL ใน .env.local";
    default:
      return error instanceof Error && error.message ? error.message : "เชื่อมต่อฐานข้อมูลไม่ได้";
  }
}
