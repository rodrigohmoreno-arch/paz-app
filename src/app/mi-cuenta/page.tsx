"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MiCuenta() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f285af] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !userData) return null;

  const membershipColors = {
    white: { bg: "bg-white border-2 border-gray-200", text: "text-gray-700", label: "White - Básico" },
    black: { bg: "bg-[#1a1a2e]", text: "text-white", label: "Black - Premium" },
    pink: { bg: "bg-gradient-to-r from-[#f285af] to-[#e85d95]", text: "text-white", label: "Pink - VIP" },
  };

  const membership = membershipColors[userData.membership];

  return (
    <>
      <Navbar />
      <div className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-[#f6f1cc] to-[#fef5f8]">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-[#2b2230] mb-8">Mi Cuenta</h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-[#fde8ef]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f285af] to-[#e85d95] flex items-center justify-center text-white text-2xl font-bold mb-4">
                {userData.displayName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2b2230]">{userData.displayName}</h2>
              <p className="text-[#5f5668] text-sm mb-4">{userData.email}</p>
              <p className="text-xs text-gray-400">
                Miembro desde {new Date(userData.createdAt).toLocaleDateString("es-AR")}
              </p>
            </div>

            {/* Membership Card */}
            <div className={`rounded-3xl shadow-lg p-8 ${membership.bg} ${membership.text}`}>
              <p className="text-sm opacity-70 mb-2">Tu membresía</p>
              <h2 className="text-2xl font-serif font-bold mb-4">{membership.label}</h2>
              <div className="mt-6">
                <p className="text-sm opacity-70 mb-1">Puntos acumulados</p>
                <p className="text-4xl font-bold">{userData.points.toLocaleString()}</p>
              </div>
              {userData.membership === "white" && (
                <Link href="/#membresias" className="inline-block mt-6 bg-[#1a1a2e] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#2b2230] transition">
                  Mejorar Plan
                </Link>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 bg-white rounded-3xl shadow-lg p-8 border border-[#fde8ef]">
            <h3 className="text-xl font-serif font-bold text-[#2b2230] mb-4">Mis Actividades</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#fef5f8] rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-[#e85d95] mb-1">0</p>
                <p className="text-sm text-[#5f5668]">Compras</p>
              </div>
              <div className="bg-[#fef5f8] rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-[#e85d95] mb-1">0</p>
                <p className="text-sm text-[#5f5668]">Giros usados</p>
              </div>
              <div className="bg-[#fef5f8] rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-[#e85d95] mb-1">{userData.points}</p>
                <p className="text-sm text-[#5f5668]">Puntos</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="text-sm text-[#5f5668] hover:text-[#e85d95] transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
