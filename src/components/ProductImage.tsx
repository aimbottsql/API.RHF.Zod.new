"use client";

import Image from "next/image";
import { useState } from "react";

// ถ้าโหลดรูปไม่สำเร็จ (เช่น URL ปลายทางตอบ 404) ให้แสดงกรอบ "ไม่มีรูปภาพ" แทนรูปเสีย
export default function ProductImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="product-media-placeholder">ไม่มีรูปภาพ</div>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 50vw, 240px"
      onError={() => setFailed(true)}
    />
  );
}
