"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, increment, query, where } from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";
import toast from "react-hot-toast";

interface UserRow {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  membership: string;
  memberId: string;
  points: number;
  spinsUsed: number;
  spinsResetMonth: string;
  createdAt: string;
}

interface Coupon {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  code: string;
  discount: number;
  label: string;
  status: "active" | "used" | "expired";
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointsModal, setPointsModal] = useState<UserRow | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [membershipModal, setMembershipModal] = useState<UserRow | null>(null);
  const [newMembership, setNewMembership] = useState("none");
  const [couponsModal, setCouponsModal] = useState<UserRow | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserRow));
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setUsers(data);
    } catch {
      // Firebase not configured
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPoints() {
    if (!pointsModal || !db) return;
    const pts = parseInt(pointsToAdd);
    if (!pts || pts <= 0) {
      toast.error("Ingresá una cantidad válida de puntos");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", pointsModal.uid), {
        points: increment(pts),
      });
      toast.success(`+${pts} puntos agregados a ${pointsModal.displayName}`);
      setPointsModal(null);
      setPointsToAdd("");
      setReason("");
      fetchUsers();
    } catch {
      toast.error("Error al agregar puntos");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeMembership() {
    if (!membershipModal || !db) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", membershipModal.uid), {
        membership: newMembership,
      });
      const names: Record<string, string> = { none: "Ninguna", white: "Friend", yellow: "Bestie", pink: "BBF" };
      toast.success(`Membresía actualizada a ${names[newMembership] || newMembership}`);
      setMembershipModal(null);
      fetchUsers();
    } catch {
      toast.error("Error al cambiar membresía");
    } finally {
      setSaving(false);
    }
  }

  async function fetchCoupons(userId: string) {
    if (!db) return;
    setLoadingCoupons(true);
    try {
      const q = query(collection(db, "coupons"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setCoupons(data);
    } catch {
      toast.error("Error al cargar cupones");
    } finally {
      setLoadingCoupons(false);
    }
  }

  async function handleMarkCouponUsed(couponId: string) {
    if (!db) return;
    try {
      await updateDoc(doc(db, "coupons", couponId), {
        status: "used",
        usedAt: new Date().toISOString(),
      });
      toast.success("Cupón marcado como usado");
      if (couponsModal) {
        fetchCoupons(couponsModal.uid);
      }
    } catch {
      toast.error("Error al actualizar cupón");
    }
  }

  const membershipColors: Record<string, string> = {
    none: "bg-gray-100 text-gray-600",
    white: "bg-gray-50 text-gray-700 border border-gray-200",
    yellow: "bg-[#faebc8] text-[#c9a84c] border border-[#f0d99a]",
    pink: "bg-[#fde8ef] text-[#e85d95] border border-[#fcd5e3]",
  };

  const membershipNames: Record<string, string> = {
    none: "NONE",
    white: "FRIEND",
    yellow: "BESTIE",
    pink: "BBF",
  };

  function getCouponStatusColor(coupon: Coupon): string {
    if (coupon.status === "used") return "bg-gray-100 text-gray-500";
    const now = new Date();
    if (new Date(coupon.expiresAt) < now) return "bg-red-50 text-red-500";
    return "bg-green-50 text-green-600";
  }

  function getCouponStatusLabel(coupon: Coupon): string {
    if (coupon.status === "used") return "USADO";
    const now = new Date();
    if (new Date(coupon.expiresAt) < now) return "EXPIRADO";
    return "ACTIVO";
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-[#2b2230] mb-8">Usuarios</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-[#5f5668]">
          <div className="w-5 h-5 border-2 border-[#f285af] border-t-transparent rounded-full animate-spin" />
          Cargando usuarios...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-100">
          <p className="text-[#5f5668]">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.uid} className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-[#2b2230]">{u.displayName}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${membershipColors[u.membership] || membershipColors.none}`}>
                    {membershipNames[u.membership] || "NONE"}
                  </span>
                </div>
                <p className="text-sm text-[#5f5668]">{u.email}</p>
                {u.phone && <p className="text-sm text-[#5f5668]">{u.phone}</p>}
                {u.memberId && <p className="text-xs text-gray-400">ID: {u.memberId}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  Giros: {u.spinsResetMonth === new Date().toISOString().slice(0, 7) ? (u.spinsUsed || 0) : 0} usados este mes
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-2xl font-bold text-[#e85d95]">{(u.points || 0).toLocaleString()}</p>
                <p className="text-xs text-[#5f5668]">puntos</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setPointsModal(u); setPointsToAdd(""); setReason(""); }}
                  className="bg-[#e85d95] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#d43d78] transition"
                >
                  + Puntos
                </button>
                <button
                  onClick={() => { setMembershipModal(u); setNewMembership(u.membership || "none"); }}
                  className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Membresía
                </button>
                <button
                  onClick={() => { setCouponsModal(u); fetchCoupons(u.uid); }}
                  className="border border-[#f285af] text-[#e85d95] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#fef5f8] transition"
                >
                  Cupones
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Points Modal */}
      {pointsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-serif font-bold mb-2">Cargar Puntos</h2>
            <p className="text-sm text-[#5f5668] mb-6">Usuario: <strong>{pointsModal.displayName}</strong> ({pointsModal.email})</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad de puntos *</label>
                <input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm"
                  placeholder="Ej: 500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm"
                  placeholder="Ej: Compra en tienda física"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddPoints}
                disabled={saving}
                className="flex-1 btn-primary text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Cargar Puntos"}
              </button>
              <button onClick={() => setPointsModal(null)} className="px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Membership Modal */}
      {membershipModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-serif font-bold mb-2">Cambiar Membresía</h2>
            <p className="text-sm text-[#5f5668] mb-6">Usuario: <strong>{membershipModal.displayName}</strong></p>
            <div>
              <label className="block text-sm font-medium mb-2">Membresía</label>
              <select
                value={newMembership}
                onChange={(e) => setNewMembership(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm"
              >
                <option value="none">Sin membresía</option>
                <option value="white">Friend - Básico</option>
                <option value="yellow">Bestie - Premium</option>
                <option value="pink">BBF - VIP</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleChangeMembership}
                disabled={saving}
                className="flex-1 btn-primary text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => setMembershipModal(null)} className="px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Modal */}
      {couponsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-serif font-bold mb-2">Cupones</h2>
            <p className="text-sm text-[#5f5668] mb-6">Usuario: <strong>{couponsModal.displayName}</strong> ({couponsModal.email})</p>

            {loadingCoupons ? (
              <div className="flex items-center gap-2 text-[#5f5668] py-4">
                <div className="w-5 h-5 border-2 border-[#f285af] border-t-transparent rounded-full animate-spin" />
                Cargando cupones...
              </div>
            ) : coupons.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">Este usuario no tiene cupones</p>
            ) : (
              <div className="space-y-3">
                {coupons.map((c) => (
                  <div key={c.id} className="border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-[#2b2230] tracking-wider">{c.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getCouponStatusColor(c)}`}>
                        {getCouponStatusLabel(c)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#e85d95] font-semibold">{c.discount}% de descuento</p>
                        <p className="text-xs text-gray-400">
                          Vence: {new Date(c.expiresAt).toLocaleDateString("es-AR")}
                          {c.usedAt && ` · Usado: ${new Date(c.usedAt).toLocaleDateString("es-AR")}`}
                        </p>
                      </div>
                      {getCouponStatusLabel(c) === "ACTIVO" && (
                        <button
                          onClick={() => handleMarkCouponUsed(c.id)}
                          className="bg-[#2b2230] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#3d2f44] transition"
                        >
                          Marcar Usado
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button onClick={() => setCouponsModal(null)} className="w-full px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
