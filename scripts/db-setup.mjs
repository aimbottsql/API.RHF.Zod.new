// สร้างตาราง products และใส่ข้อมูลเริ่มต้น
// ลำดับ: db/seed.sql (ถ้ามี จาก npm run db:export) → src/data/products-fallback.json
// รัน: npm run db:setup
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { connectOrExplain } from "./env.mjs";

const SEED_SQL = new URL("../db/seed.sql", import.meta.url);

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await connectOrExplain(client);

try {
  await client.query(await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"));

  const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM products");
  if (rows[0].count > 0) {
    console.log(`ตาราง products มีข้อมูลอยู่แล้ว ${rows[0].count} รายการ ไม่ต้องใส่ข้อมูลเริ่มต้น`);
  } else if (existsSync(SEED_SQL)) {
    // มีไฟล์ที่ส่งออกจาก npm run db:export → ใช้ข้อมูลชุดนั้น
    await client.query("BEGIN");
    await client.query(await readFile(SEED_SQL, "utf8"));
    await client.query("COMMIT");
    const { rows: after } = await client.query("SELECT COUNT(*)::int AS count FROM products");
    console.log(`นำเข้าข้อมูลจาก db/seed.sql ${after[0].count} รายการเรียบร้อย`);
  } else {
    const data = JSON.parse(
      await readFile(new URL("../src/data/products-fallback.json", import.meta.url), "utf8")
    );

    await client.query("BEGIN");
    for (const p of data.products) {
      await client.query(
        `INSERT INTO products (id, title, price, stock, category, description, thumbnail)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [p.id, p.title, p.price, p.stock, p.category, p.description ?? null, p.thumbnail ?? null]
      );
    }
    // ให้ id ถัดไปต่อจาก id สูงสุดที่ใส่ไป
    await client.query(
      "SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products))"
    );
    await client.query("COMMIT");
    console.log(`ใส่ข้อมูลเริ่มต้น ${data.products.length} รายการเรียบร้อย`);
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("ตั้งค่าฐานข้อมูลไม่สำเร็จ:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
