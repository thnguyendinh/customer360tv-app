import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer 360 App",
  description: "Customer 360 analytics demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <div className="flex min-h-screen">
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white p-5">
              <div className="mb-8">
                <h1 className="text-2xl font-bold">Customer360</h1>
                <p className="text-sm text-slate-500">Analytics App</p>
              </div>

              <nav className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  className="rounded-xl px-4 py-3 text-slate-800 hover:bg-slate-100"
                >
                  Dashboard
                </Link>
                <Link
                  href="/customers"
                  className="rounded-xl px-4 py-3 text-slate-800 hover:bg-slate-100"
                >
                  Customers
                </Link>
                <Link
                  href="/segments"
                  className="rounded-xl px-4 py-3 text-slate-800 hover:bg-slate-100"
                >
                  Segments
                </Link>
              </nav>
            </aside>

            <div className="flex-1">
              <header className="border-b border-slate-200 bg-white px-6 py-4 md:hidden">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold">Customer360</h1>
                  <div className="flex gap-3 text-sm">
                    <Link href="/dashboard">Dashboard</Link>
                    <Link href="/customers">Customers</Link>
                    <Link href="/segments">Segments</Link>
                  </div>
                </div>
              </header>

              <div>{children}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}