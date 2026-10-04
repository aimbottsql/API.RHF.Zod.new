// เปิด PostgreSQL ในเครื่องโดยไม่ต้องติดตั้งเอง (ใช้ package embedded-postgres)
// ข้อมูลเก็บในโฟลเดอร์ .postgres-data และยังอยู่แม้ปิดแล้วเปิดใหม่
// รัน: npm run db:start  (เปิดค้างไว้ใน terminal แยก กด Ctrl + C เพื่อปิด)
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { LOCAL_DATABASE_URL } from "./env.mjs";

const DATA_DIR = ".postgres-data";
const PORT = 5433;
const DATABASE = "product_explorer";
const DATABASE_URL = LOCAL_DATABASE_URL;

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

const isFirstRun = !existsSync(DATA_DIR);
if (isFirstRun) {
  console.log("ครั้งแรก: กำลังเตรียมโฟลเดอร์ฐานข้อมูล...");
  await pg.initialise();
}

await pg.start();

if (isFirstRun) {
  await pg.createDatabase(DATABASE);
}

// สร้างตารางและใส่ข้อมูลเริ่มต้น (ถ้ามีข้อมูลอยู่แล้วจะข้าม)
spawnSync(process.execPath, ["scripts/db-setup.mjs"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL },
});

console.log(`\nPostgreSQL พร้อมใช้งานที่ port ${PORT}`);
console.log(`DATABASE_URL="${DATABASE_URL}"`);
console.log("เปิด terminal นี้ค้างไว้ แล้วรัน npm run dev ในอีก terminal (กด Ctrl + C เพื่อปิดฐานข้อมูล)\n");

async function shutdown() {
  console.log("\nกำลังปิด PostgreSQL...");
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ให้ process ทำงานค้างไว้จนกว่าจะกด Ctrl + C
setInterval(() => {}, 1 << 30);
