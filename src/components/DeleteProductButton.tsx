"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal, useFormStatus } from "react-dom";
import { deleteProduct } from "@/actions/products";

type DeleteProductButtonProps = {
  id: number;
  title: string;
};

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-danger" disabled={pending} autoFocus>
      {pending ? "กำลังลบ..." : "ลบสินค้า"}
    </button>
  );
}

// Modal ยืนยันเป็นแค่ UX ฝั่ง client — การตรวจสิทธิ์จริงอยู่ใน deleteProduct ฝั่ง server
export default function DeleteProductButton({ id, title }: DeleteProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="btn-icon btn-icon-danger"
        onClick={() => setIsOpen(true)}
      >
        ลบ
      </button>

      {/* ใช้ portal เพราะการ์ดสินค้ามี transform ตอน hover ซึ่งทำให้ position: fixed เพี้ยน */}
      {isOpen &&
        createPortal(
          <div className="modal-overlay" onClick={close}>
            <div
              className="confirm-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={`delete-title-${id}`}
              aria-describedby={`delete-desc-${id}`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="confirm-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </div>

              <h2 id={`delete-title-${id}`} className="confirm-title">ลบสินค้านี้?</h2>
              <p id={`delete-desc-${id}`} className="confirm-text">
                <strong>{title}</strong> จะถูกลบออกจากรายการถาวร
                <br />
                และไม่สามารถกู้คืนได้
              </p>

              <form action={deleteProduct} className="confirm-actions">
                <input type="hidden" name="id" value={id} />
                <button type="button" className="btn btn-ghost" onClick={close}>
                  ยกเลิก
                </button>
                <ConfirmDeleteButton />
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
