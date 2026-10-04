import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import ProductEditor from "@/components/ProductEditor";
import { getProduct } from "@/lib/product-store";

export default async function EditProductPage({ params }: PageProps<"/manage/[id]/edit">) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/manage/${id}/edit`);

  const product = await getProduct(Number(id));
  if (!product) notFound();

  return (
    <main className="page">
      <header className="page-header">
        <h1>แก้ไขสินค้า</h1>
        <p className="page-subtitle">
          <Link href="/">← กลับไปหน้ารายการสินค้า</Link>
        </p>
      </header>
      <ProductEditor product={product} />
    </main>
  );
}
