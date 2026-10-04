import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Product Explorer",
  description: "ระบบจัดการรายการสินค้า",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${kanit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <nav className="site-header">
          <Link href="/" className="site-brand">Product Explorer</Link>
          <AuthStatus />
        </nav>
        {children}
      </body>
    </html>
  );
}