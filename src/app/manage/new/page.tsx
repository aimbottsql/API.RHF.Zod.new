import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ProductEditor from "@/components/ProductEditor";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/manage/new");

  return (
    <main className="page">
      <header className="page-header">
        <h1>เพิ่มสินค้าใหม่</h1>
        <p className="page-subtitle">
          <Link href="/">← กลับไปหน้ารายการสินค้า</Link>
        </p>
      </header>
      <ProductEditor />
    </main>
  );
}
