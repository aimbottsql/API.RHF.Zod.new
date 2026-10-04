// ส่งออกข้อมูลสินค้าปัจจุบันทั้งหมดเป็นไฟล์ db/seed.sql
// เครื่องอื่นที่รัน npm run db:start / db:setup จะได้ข้อมูลชุดเดียวกัน
// รัน: npm run db:export  (ต้องเปิด npm run db:start ค้างไว้)
import { writeFile } from "node:fs/promises";
import pg from "pg";
import { connectOrExplain } from "./env.mjs";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await connectOrExplain(client);

try {
  const { rows } = await client.query(
    "SELECT id, title, price::text AS price, stock, category, description, thumbnail FROM products ORDER BY id"
  );

  // ใช้ format ของ PostgreSQL ช่วย escape ข้อความ (เช่นชื่อที่มี ' อย่าง Dior J'adore)
  const values = [];
  for (const row of rows) {
    const { rows: [line] } = await client.query(
      "SELECT format('(%s, %L, %s, %s, %L, %L, %L)', $1::int, $2::text, $3::numeric, $4::int, $5::text, $6::text, $7::text) AS sql",
      [row.id, row.title, row.price, row.stock, row.category, row.description, row.thumbnail]
    );
    values.push("  " + line.sql);
  }

  const sql = [
    `-- ข้อมูลสินค้า ${rows.length} รายการ ส่งออกเมื่อ ${new Date().toISOString()}`,
    "-- สร้างด้วย npm run db:export และถูกนำเข้าอัตโนมัติโดย npm run db:start / db:setup",
    rows.length > 0
      ? `INSERT INTO products (id, title, price, stock, category, description, thumbnail) VALUES\n${values.join(",\n")};`
      : "-- (ไม่มีข้อมูล)",
    "SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));",
    "",
  ].join("\n");

  await writeFile(new URL("../db/seed.sql", import.meta.url), sql, "utf8");
  console.log(`ส่งออก ${rows.length} รายการไปที่ db/seed.sql เรียบร้อย`);
} finally {
  await client.end();
}
