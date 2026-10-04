import Image from "next/image";
import { auth } from "@/auth";
import { signInWithGoogle, signOutAction } from "@/actions/auth";

// Server Component: อ่าน session ฝั่ง server แล้วเลือก UI ตามสถานะ
export default async function AuthStatus() {
  const session = await auth();

  if (!session?.user) {
    return (
      <form action={signInWithGoogle}>
        <input type="hidden" name="callbackUrl" value="/" />
        <button type="submit" className="btn btn-primary">เข้าสู่ระบบด้วย Google</button>
      </form>
    );
  }

  return (
    <div className="auth-status">
      {session.user.image && (
        <Image src={session.user.image} alt="" width={32} height={32} className="avatar" />
      )}
      <span className="auth-name">{session.user.name ?? session.user.email}</span>
      <form action={signOutAction}>
        <button type="submit" className="btn btn-ghost">ออกจากระบบ</button>
      </form>
    </div>
  );
}
