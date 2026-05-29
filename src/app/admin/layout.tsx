"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/login");
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#f285af] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5f5668]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || userData?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-[#1a1a2e] text-white z-50 hidden lg:block">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="text-xl font-serif font-bold">PAZ Admin</Link>
          <p className="text-sm text-gray-400 mt-1">{userData.displayName}</p>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
            Dashboard
          </Link>
          <Link href="/admin/productos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
            Productos
          </Link>
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
              Volver al sitio
            </Link>
          </div>
        </nav>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden bg-[#1a1a2e] text-white px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-serif font-bold">PAZ Admin</Link>
        <div className="flex gap-3">
          <Link href="/admin/productos" className="text-sm hover:text-[#f285af] transition">Productos</Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition">Sitio</Link>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
