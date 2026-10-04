import Link from "next/link";
import { auth } from "@/auth";
import DeleteProductButton from "@/components/DeleteProductButton";
import ProductImage from "@/components/ProductImage";
import ProductSearchForm from "@/components/ProductSearchForm";
import { SearchQuerySchema, defaultQuery } from "@/lib/products";
import { searchProducts } from "@/lib/product-store";

// Server Component: ทุกคนดูรายการสินค้าได้
// แต่ลิงก์แก้ไข/ปุ่มลบจะแสดงเฉพาะผู้ที่เข้าสู่ระบบแล้ว
export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const parsed = SearchQuerySchema.safeParse({
    q: typeof params.q === "string" ? params.q : defaultQuery.q,
    limit: typeof params.limit === "string" ? Number(params.limit) : defaultQuery.limit,
    sortBy: typeof params.sortBy === "string" ? params.sortBy : defaultQuery.sortBy,
  });
  const query = parsed.success ? parsed.data : defaultQuery;

  const session = await auth();
  const isSignedIn = !!session?.user;
  // ถ้ายังเชื่อมต่อฐานข้อมูลไม่ได้ ให้หน้าเว็บยังเปิดได้ (เข้าสู่ระบบได้ตามปกติ) และแจ้งปัญหาแทน
  let products: Awaited<ReturnType<typeof searchProducts>> = [];
  let dbError = "";
  try {
    products = await searchProducts(query);
  } catch (error) {
    console.error(error);
    dbError = error instanceof Error ? error.message : "เชื่อมต่อฐานข้อมูลไม่ได้";
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>รายการสินค้า</h1>
        <p className="page-subtitle">ค้นหา จัดการ และติดตามสต๊อกสินค้า</p>
      </header>

      <div className="toolbar">
        <ProductSearchForm initialQuery={query} />

        {/* การซ่อนปุ่มเป็นแค่ UI — การป้องกันจริงอยู่ที่ proxy และ Server Action */}
        {isSignedIn && (
          <div className="toolbar-actions">
            <Link href="/manage/new" className="btn btn-primary">+ เพิ่มสินค้าใหม่</Link>
          </div>
        )}
      </div>

      <section aria-live="polite" className="results">
        {dbError ? (
          <p className="state-message state-error" role="alert">
            โหลดสินค้าไม่สำเร็จ: {dbError}
          </p>
        ) : products.length === 0 ? (
          <p className="state-message">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        ) : (
          <div className="product-grid">
            {products.map((item) => (
              <article key={item.id} className="product-card">
                <div className="product-media">
                  <ProductImage src={item.thumbnail} alt={item.title} />
                  <span className="product-chip">{item.category}</span>
                </div>

                <div className="product-body">
                  <h2 className="product-title">{item.title}</h2>
                  <p className="product-price">฿{item.price.toLocaleString()}</p>
                  <p className="product-stock">คงเหลือ {item.stock} ชิ้น</p>
                </div>

                {isSignedIn && (
                  <div className="product-actions">
                    <Link href={`/manage/${item.id}/edit`} className="btn-icon">แก้ไข</Link>
                    <DeleteProductButton id={item.id} title={item.title} />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
