"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  label: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export default function MiCuenta() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadCoupons() {
      if (!user || !db) return;
      try {
        const q = query(collection(db, "coupons"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
        const now = new Date();
        const active = data.filter((c) => c.status === "active" && new Date(c.expiresAt) > now);
        active.sort((a, b) => (a.expiresAt || "").localeCompare(b.expiresAt || ""));
        setCoupons(active);
      } catch {
        // ignore
      }
    }
    loadCoupons();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f285af] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !userData) return null;

  const membershipConfig: Record<string, { bg: string; text: string; label: string; spins: number; discount: number }> = {
    none: { bg: "bg-gray-100 border-2 border-gray-200", text: "text-gray-700", label: "Sin membresía", spins: 0, discount: 0 },
    white: { bg: "bg-white border-2 border-gray-200", text: "text-gray-700", label: "Friend - Básico", spins: 15, discount: 0 },
    yellow: { bg: "bg-[#faebc8] border-2 border-[#f0d99a]", text: "text-[#2b2230]", label: "Bestie - Premium", spins: 30, discount: 10 },
    pink: { bg: "bg-[#fde8ef] border-2 border-[#fcd5e3]", text: "text-[#2b2230]", label: "BBF - VIP", spins: 60, discount: 20 },
  };

  const membership = membershipConfig[userData.membership] || membershipConfig.none;
  const hasMembership = userData.membership !== "none";

  const currentMonth = new Date().toISOString().slice(0, 7);
  const spinsUsedThisMonth = userData.spinsResetMonth === currentMonth ? (userData.spinsUsed || 0) : 0;
  const spinsRemaining = Math.max(0, membership.spins - spinsUsedThisMonth);

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
              <p className="text-[#5f5668] text-sm mb-1">{userData.email}</p>
              {userData.phone && (
                <p className="text-[#5f5668] text-sm mb-1">{userData.phone}</p>
              )}
              {userData.memberId && (
                <div className="mt-3 bg-[#fef5f8] rounded-xl p-3">
                  <p className="text-xs text-[#5f5668]">ID de miembro</p>
                  <p className="text-lg font-bold text-[#2b2230] font-mono tracking-wider">{userData.memberId}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Miembro desde {new Date(userData.createdAt).toLocaleDateString("es-AR")}
              </p>
            </div>

            {/* Membership Card */}
            <div className={`rounded-3xl shadow-lg p-8 ${membership.bg} ${membership.text}`}>
              <p className="text-sm opacity-70 mb-2">Tu membresía</p>
              <h2 className="text-2xl font-serif font-bold mb-4">{membership.label}</h2>

              {hasMembership ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm opacity-70 mb-1">Puntos acumulados</p>
                      <p className="text-3xl font-bold">{(userData.points || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70 mb-1">Giros restantes</p>
                      <p className="text-3xl font-bold">{spinsRemaining} / {membership.spins}</p>
                    </div>
                  </div>
                  {membership.discount > 0 && (
                    <div className="mt-4 bg-white/20 rounded-xl p-3">
                      <p className="text-sm font-semibold">{membership.discount}% de descuento en todas tus compras</p>
                    </div>
                  )}
                  {userData.membership === "pink" && (
                    <div className="mt-3 bg-white/20 rounded-xl p-3">
                      <p className="text-sm font-semibold">Participás del sorteo exclusivo de fin de año</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4">
                  <p className="text-sm mb-4">Suscribite a una membresía para acceder a Club Hello PAZ, descuentos y más beneficios.</p>
                  <Link href="/#membresias" className="inline-block bg-[#1a1a2e] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#2b2230] transition">
                    Ver Membresías
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Coupons */}
          {coupons.length > 0 && (
            <div className="mt-8 bg-white rounded-3xl shadow-lg p-8 border border-[#fde8ef]">
              <h3 className="text-xl font-serif font-bold text-[#2b2230] mb-4">Mis Cupones Activos</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="border border-[#fde8ef] rounded-2xl p-4 bg-gradient-to-r from-[#fef5f8] to-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-[#2b2230] tracking-wider text-sm">{c.code}</span>
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">ACTIVO</span>
                    </div>
                    <p className="text-lg font-bold text-[#e85d95]">{c.discount}% de descuento</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Vence: {new Date(c.expiresAt).toLocaleDateString("es-AR")}
                    </p>
                    <p className="text-xs text-[#5f5668] mt-2">Usá este código en tu próxima compra online o en tienda</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          <div className="mt-8 bg-white rounded-3xl shadow-lg p-8 border border-[#fde8ef]">
            <h3 className="text-xl font-serif font-bold text-[#2b2230] mb-4">Mis Actividades</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#fef5f8] rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-[#e85d95] mb-1">0</p>
                <p className="text-sm text-[#5f5668]">Compras</p>
              </div>
              <div className="bg-[#fef5f8] rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-[#e85d95] mb-1">{spinsUsedThisMonth}</p>
                <p className="text-sm text-[#5f5668]">Giros usados este mes</p>
              </div>
              <div className="bg-[#fef5f8] rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-[#e85d95] mb-1">{(userData.points || 0).toLocaleString()}</p>
                <p className="text-sm text-[#5f5668]">Puntos Club Hello PAZ</p>
              </div>
            </div>
          </div>

          {/* Points info */}
          {hasMembership && (
            <div className="mt-6 bg-gradient-to-r from-[#f6f1cc] to-[#fef5f8] rounded-3xl p-8 border border-[#fde8ef]">
              <h3 className="text-lg font-serif font-bold text-[#2b2230] mb-3">Tus puntos Club Hello PAZ</h3>
              <p className="text-sm text-[#5f5668] mb-2">
                Los puntos que acumulás con tus compras web y físicas pueden canjearse por mercadería y beneficios en la tienda.
              </p>
              <Link href="/#tienda" className="text-sm text-[#e85d95] font-semibold hover:underline">
                Ver productos para canjear →
              </Link>
            </div>
          )}

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
