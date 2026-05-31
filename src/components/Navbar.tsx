"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userData, signOut } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#f6f1cc]/90 backdrop-blur-xl border-b border-[#fde8ef] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo/logo-paz.jpg" alt="Paz" width={170} height={57} className="w-[130px] md:w-[170px] object-contain" />
        </Link>

        <div className="hidden md:flex gap-10 font-medium text-sm tracking-wide items-center">
          <Link href="/#inicio" className="hover:text-[#e85d95] transition duration-300">INICIO</Link>
          <Link href="/#tienda" className="hover:text-[#e85d95] transition duration-300">TIENDA</Link>
          <Link href="/#membresias" className="hover:text-[#e85d95] transition duration-300">MEMBRESÍAS</Link>
          <Link href="/#club-paz-points" className="hover:text-[#e85d95] transition duration-300">CLUB HELLO PAZ</Link>
          <Link href="/#contacto" className="hover:text-[#e85d95] transition duration-300">CONTACTO</Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link href="/carrito" className="relative p-2 hover:text-[#e85d95] transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e85d95] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              {userData?.role === "admin" && (
                <Link href="/admin" className="text-sm font-semibold text-[#1a1a2e] hover:text-[#e85d95] transition">
                  Admin
                </Link>
              )}
              <Link href="/mi-cuenta" className="text-sm font-semibold text-[#2b2230] hover:text-[#e85d95] transition">
                {userData?.displayName || "Mi Cuenta"}
              </Link>
              <button onClick={signOut} className="text-sm text-[#5f5668] hover:text-[#e85d95] transition">
                Salir
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-[#2b2230] hover:text-[#e85d95] transition">
                Iniciar Sesión
              </Link>
              <Link href="/registro" className="bg-gradient-to-r from-[#f285af] to-[#e85d95] text-white px-6 py-2.5 rounded-full shadow-lg text-sm font-semibold hover:scale-105 transition">
                Registrarse
              </Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
            <span className="block w-6 h-0.5 bg-[#2b2230] transition-all" />
            <span className="block w-6 h-0.5 bg-[#2b2230] transition-all" />
            <span className="block w-6 h-0.5 bg-[#2b2230] transition-all" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#f6f1cc]/95 backdrop-blur-xl border-t border-[#fde8ef]">
          <div className="px-6 py-4 flex flex-col gap-4 text-sm font-medium tracking-wide">
            <Link href="/#inicio" onClick={() => setMobileOpen(false)}>INICIO</Link>
            <Link href="/#tienda" onClick={() => setMobileOpen(false)}>TIENDA</Link>
            <Link href="/#membresias" onClick={() => setMobileOpen(false)}>MEMBRESÍAS</Link>
            <Link href="/#club-paz-points" onClick={() => setMobileOpen(false)}>CLUB HELLO PAZ</Link>
            <Link href="/#contacto" onClick={() => setMobileOpen(false)}>CONTACTO</Link>
            <Link href="/carrito" onClick={() => setMobileOpen(false)}>CARRITO ({totalItems})</Link>
            {user ? (
              <>
                {userData?.role === "admin" && <Link href="/admin" onClick={() => setMobileOpen(false)}>ADMIN</Link>}
                <Link href="/mi-cuenta" onClick={() => setMobileOpen(false)}>MI CUENTA</Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-left">SALIR</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>INICIAR SESIÓN</Link>
                <Link href="/registro" onClick={() => setMobileOpen(false)} className="bg-gradient-to-r from-[#f285af] to-[#e85d95] text-white px-6 py-2.5 rounded-full shadow-lg text-sm font-semibold w-fit">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
