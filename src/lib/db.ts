import { Pool } from "pg";

// Connection pool ของ PostgreSQL ใช้ร่วมกันทั้งแอป (รันฝั่ง server เท่านั้น)
// เก็บไว้ใน globalThis เพื่อไม่ให้สร้าง pool ใหม่ทุกครั้งที่ hot reload ตอน dev
const globalForDb = globalThis as unknown as { pool?: Pool };

export function db(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("ยังไม่ได้ตั้งค่า DATABASE_URL ใน .env.local (ดูวิธีทำใน README.md)");
  }
  globalForDb.pool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return globalForDb.pool;
}
