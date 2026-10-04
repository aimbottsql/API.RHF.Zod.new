"use client";

import { useActionState } from "react";
import { saveProduct } from "@/actions/products";
import type { SaveProductState } from "@/actions/products";
import { CATEGORIES } from "@/lib/products";
import type { Product } from "@/lib/products";

const initialState: SaveProductState = {};

// Client Component ที่ส่งฟอร์มไปยัง Server Action ด้วย POST
// มี product = แก้ไข, ไม่มี product = เพิ่มใหม่
export default function ProductEditor({ product }: { product?: Product }) {
  const [state, formAction, isPending] = useActionState(saveProduct, initialState);

  return (
    <form action={formAction} className="product-form" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="field">
        <label htmlFor="title">ชื่อสินค้า</label>
        <input id="title" name="title" className="input" defaultValue={product?.title}
          aria-invalid={!!state.errors?.title} aria-describedby="title-error" />
        <span id="title-error" className="field-error" role="alert">{state.errors?.title?.[0]}</span>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="price">ราคา</label>
          <input id="price" name="price" type="number" step="0.01" className="input"
            defaultValue={product?.price}
            aria-invalid={!!state.errors?.price} aria-describedby="price-error" />
          <span id="price-error" className="field-error" role="alert">{state.errors?.price?.[0]}</span>
        </div>

        <div className="field">
          <label htmlFor="stock">คงเหลือ</label>
          <input id="stock" name="stock" type="number" step="1" className="input"
            defaultValue={product?.stock}
            aria-invalid={!!state.errors?.stock} aria-describedby="stock-error" />
          <span id="stock-error" className="field-error" role="alert">{state.errors?.stock?.[0]}</span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="category">หมวดหมู่</label>
        <select id="category" name="category" className="input" defaultValue={product?.category ?? ""}
          aria-invalid={!!state.errors?.category} aria-describedby="category-error">
          <option value="" disabled>กรุณาเลือกหมวดหมู่</option>
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <span id="category-error" className="field-error" role="alert">{state.errors?.category?.[0]}</span>
      </div>

      {state.message && <p className="state-message state-error" role="alert">{state.message}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "กำลังบันทึก" : product ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
        </button>
      </div>
    </form>
  );
}
