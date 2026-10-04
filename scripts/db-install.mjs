// ติดตั้ง PostgreSQL 17 ลงเครื่อง (Windows) ผ่าน winget แล้วเตรียมฐานข้อมูลให้พร้อมใช้
// รัน: npm run db:install  (ใน terminal ของ VS Code ได้เลย ถ้ามีหน้าต่าง UAC ขึ้นมาให้กด Yes)
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import net from "node:net";

const PORT = 5432;
const DATABASE_URL = `postgresql://postgres:postgres@localhost:${PORT}/product_explorer`;

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, "127.0.0.1");
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

async function waitForPort(port, seconds) {
  for (let i = 0; i < seconds; i++) {
    if (await isPortOpen(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

if (process.platform !== "win32") {
  console.log("คำสั่งนี้รองรับเฉพาะ Windows — บน macOS/Linux ให้ใช้ npm run db:start แทน");
  process.exit(1);
}

// 1. ติดตั้ง PostgreSQL (ข้ามถ้ามีอยู่แล้ว)
if (await isPortOpen(PORT)) {
  console.log(`พบ PostgreSQL ที่ port ${PORT} อยู่แล้ว ข้ามขั้นติดตั้ง`);
} else {
  console.log("กำลังติดตั้ง PostgreSQL 17 ผ่าน winget (ประมาณ 2–5 นาที)");
  console.log("ถ้ามีหน้าต่าง \"Do you want to allow this app to make changes\" ขึ้นมา ให้กด Yes\n");

  const result = spawnSync(
    "winget",
    [
      "install", "-e", "--id", "PostgreSQL.PostgreSQL.17",
      "--accept-package-agreements", "--accept-source-agreements",
      "--override", `--mode unattended --superpassword postgres --serverport ${PORT}`,
    ],
    { stdio: "inherit" }
  );

  if (result.error) {
    console.error("\nไม่พบคำสั่ง winget — อัปเดต App Installer จาก Microsoft Store แล้วเปิด VS Code ใหม่");
    process.exit(1);
  }

  console.log("\nรอให้ PostgreSQL เริ่มทำงาน...");
  if (!(await waitForPort(PORT, 60))) {
    console.error("ติดตั้งไม่สำเร็จ หรือ PostgreSQL ยังไม่ทำงาน");
    console.error("→ ลองรัน npm run db:install อีกครั้ง หรือเปิด Services แล้ว Start บริการ postgresql-x64-17");
    process.exit(1);
  }
}

// 2. ตั้งค่า DATABASE_URL ใน .env.local
if (!existsSync(".env.local")) {
  copyFileSync(".env.example", ".env.local");
  console.log("สร้าง .env.local จาก .env.example");
}
const env = readFileSync(".env.local", "utf8");
const line = `DATABASE_URL="${DATABASE_URL}"`;
writeFileSync(
  ".env.local",
  /^DATABASE_URL=.*$/m.test(env) ? env.replace(/^DATABASE_URL=.*$/m, line) : `${env.trimEnd()}\n${line}\n`
);
console.log(`ตั้งค่า ${line} ใน .env.local`);

// 3. สร้างฐานข้อมูล ตาราง และใส่ข้อมูลสินค้า
const setup = spawnSync(process.execPath, ["scripts/db-setup.mjs"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL },
});
if (setup.status !== 0) process.exit(setup.status ?? 1);

console.log("\nเสร็จแล้ว! รัน npm run dev แล้วเปิด http://localhost:3000");
