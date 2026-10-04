import { db } from "@/lib/db";
import { ProductSchema } from "@/lib/products";
import type { Product, ProductDraft, SearchQuery } from "@/lib/products";

// ฟังก์ชันอ่าน/เขียนตาราง products ใน PostgreSQL
// ทุกค่าที่มาจากผู้ใช้ส่งผ่าน $1, $2, ... เสมอ ห้ามต่อ string เข้า SQL ตรง ๆ (ป้องกัน SQL injection)

// price เป็น NUMERIC ซึ่ง pg คืนค่าเป็น string จึงแปลงเป็น float8 ใน SELECT
const COLUMNS = "id, title, price::float8 AS price, stock, category, description, thumbnail";

// ชื่อคอลัมน์ใน ORDER BY ใช้ $1 ไม่ได้ จึงเลือกจากรายการที่กำหนดไว้เท่านั้น
const SORT_COLUMNS: Record<SearchQuery["sortBy"], string> = {
  title: "title",
  price: "price",
  stock: "stock",
};

type ProductRow = Omit<Product, "description" | "thumbnail"> & {
  description: string | null;
  thumbnail: string | null;
};

function toProduct(row: ProductRow): Product {
  return ProductSchema.parse({
    ...row,
    description: row.description ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
  });
}

export async function searchProducts(query: SearchQuery): Promise<Product[]> {
  const { rows } = await db().query<ProductRow>(
    `SELECT ${COLUMNS} FROM products
     WHERE title ILIKE $1
     ORDER BY ${SORT_COLUMNS[query.sortBy]} ASC, id ASC
     LIMIT $2`,
    [`%${query.q}%`, query.limit]
  );
  return rows.map(toProduct);
}

export async function getProduct(id: number): Promise<Product | undefined> {
  if (!Number.isInteger(id)) return undefined;
  const { rows } = await db().query<ProductRow>(
    `SELECT ${COLUMNS} FROM products WHERE id = $1`,
    [id]
  );
  return rows[0] ? toProduct(rows[0]) : undefined;
}

export async function createProduct(draft: ProductDraft): Promise<Product> {
  const { rows } = await db().query<ProductRow>(
    `INSERT INTO products (title, price, stock, category, description, thumbnail)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [draft.title, draft.price, draft.stock, draft.category, draft.description ?? null, draft.thumbnail ?? null]
  );
  return toProduct(rows[0]);
}

export async function updateProductById(id: number, draft: ProductDraft): Promise<boolean> {
  if (!Number.isInteger(id)) return false;
  const { rowCount } = await db().query(
    `UPDATE products SET title = $2, price = $3, stock = $4, category = $5 WHERE id = $1`,
    [id, draft.title, draft.price, draft.stock, draft.category]
  );
  return rowCount === 1;
}

export async function deleteProductById(id: number): Promise<boolean> {
  if (!Number.isInteger(id)) return false;
  const { rowCount } = await db().query("DELETE FROM products WHERE id = $1", [id]);
  return rowCount === 1;
}
