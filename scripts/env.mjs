// โหลดค่าจาก .env.local ถ้ามี (ไม่มีก็ไม่ error)
// และใช้ฐานข้อมูลในเครื่องจาก npm run db:start เป็นค่าเริ่มต้น
import { existsSync, readFileSync } from "node:fs";

export const LOCAL_DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/product_explorer";

if (existsSync(".env.local")) {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(".env.local");
  } else {
    // Node เวอร์ชันเก่า (ก่อน 20.12) ไม่มี loadEnvFile
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.]+)\s*=\s*"?([^"#]*?)"?\s*(#.*)?$/);
      if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
    }
  }
}

process.env.DATABASE_URL ||= LOCAL_DATABASE_URL;

// เชื่อมต่อฐานข้อมูล ถ้าไม่ได้ให้บอกวิธีแก้แทน stack trace ยาว ๆ
export async function connectOrExplain(client) {
  try {
    await client.connect();
  } catch (error) {
    console.error(`เชื่อมต่อฐานข้อมูลไม่ได้ (${error.code ?? error.message})`);
    if (process.env.DATABASE_URL === LOCAL_DATABASE_URL) {
      console.error("→ เปิดฐานข้อมูลก่อนด้วย npm run db:start ใน terminal อีกหน้าต่าง แล้วรันคำสั่งนี้ใหม่");
    } else {
      console.error("→ ตรวจสอบ DATABASE_URL ใน .env.local");
    }
    process.exit(1);
  }
}
