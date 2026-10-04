"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { ProductDraftSchema } from "@/lib/products";
import { createProduct, deleteProductById, updateProductById } from "@/lib/product-store";

// Server Action เรียกได้ด้วย POST ตรงจากภายนอก (เช่น curl) โดยไม่ต้องกดปุ่มบนหน้าเว็บ
// (ปุ่มลบอยู่หน้าแรกซึ่ง proxy ไม่ได้ป้องกัน) จึงต้องตรวจ session ซ้ำทุกครั้งก่อนแก้ข้อมูล
async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

function toNumber(value: FormDataEntryValue | null): number | undefined {
  return typeof value === "string" && value.trim() !== "" ? Number(value) : undefined;
}

export type SaveProductState = {
  errors?: Partial<Record<"title" | "price" | "stock" | "category", string[]>>;
  message?: string;
};

// ใช้ทั้งเพิ่มและแก้ไข: ถ้าฟอร์มมี id คือแก้ไข ถ้าไม่มีคือเพิ่มใหม่
export async function saveProduct(
  _prevState: SaveProductState,
  formData: FormData
): Promise<SaveProductState> {
  await requireUser();

  const result = ProductDraftSchema.safeParse({
    title: formData.get("title"),
    price: toNumber(formData.get("price")),
    stock: toNumber(formData.get("stock")),
    category: formData.get("category"),
  });

  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const id = toNumber(formData.get("id"));

  if (id === undefined) {
    await createProduct(result.data);
  } else if (!(await updateProductById(id, result.data))) {
    return { message: "ไม่พบสินค้าที่ต้องการแก้ไข" };
  }

  revalidatePath("/");
  redirect("/");
}

export async function deleteProduct(formData: FormData) {
  await requireUser();

  await deleteProductById(Number(formData.get("id")));
  revalidatePath("/");
}
