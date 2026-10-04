"use client";

import Link from "next/link";

// แสดงเมื่อเกิด Error ฝั่ง server เช่น session หมดอายุ หรือเชื่อมต่อฐานข้อมูลไม่ได้
export default function ManageError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page">
      <p className="state-message state-error" role="alert">
        ทำรายการไม่สำเร็จ อาจเป็นเพราะหมดเวลาเข้าสู่ระบบ หรือเชื่อมต่อฐานข้อมูลไม่ได้
      </p>
      <div className="toolbar-actions">
        <button type="button" className="btn btn-ghost" onClick={reset}>ลองอีกครั้ง</button>
        <Link href="/login" className="btn btn-primary">เข้าสู่ระบบใหม่</Link>
      </div>
    </main>
  );
}
