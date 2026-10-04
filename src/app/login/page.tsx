import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { signInWithGoogle } from "@/actions/auth";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  // รับเฉพาะ path ภายในเว็บ ป้องกัน open redirect
  const target =
    typeof callbackUrl === "string" && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";

  if (await auth()) {
    redirect(target);
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>เข้าสู่ระบบ</h1>
        <p className="page-subtitle">ต้องเข้าสู่ระบบก่อนจึงจะเพิ่ม แก้ไข หรือลบสินค้าได้</p>
      </header>
      <form action={signInWithGoogle}>
        <input type="hidden" name="callbackUrl" value={target} />
        <button type="submit" className="btn btn-primary">เข้าสู่ระบบด้วย Google</button>
      </form>
    </main>
  );
}
