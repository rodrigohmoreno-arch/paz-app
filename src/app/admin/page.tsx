"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";

interface Stats {
  totalUsers: number;
  totalProducts: number;
  memberships: { white: number; black: number; pink: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    memberships: { white: 0, black: 0, pink: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!isConfigured || !db) {
        setLoading(false);
        return;
      }
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const productsSnap = await getDocs(collection(db, "products"));

        const memberships = { white: 0, black: 0, pink: 0 };
        usersSnap.docs.forEach((doc) => {
          const data = doc.data();
          const m = data.membership as "white" | "black" | "pink";
          if (m in memberships) memberships[m]++;
        });

        setStats({
          totalUsers: usersSnap.size,
          totalProducts: productsSnap.size,
          memberships,
        });
      } catch {
        // Firebase not configured yet
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-[#2b2230] mb-8">Dashboard</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-[#5f5668]">
          <div className="w-5 h-5 border-2 border-[#f285af] border-t-transparent rounded-full animate-spin" />
          Cargando estadísticas...
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <p className="text-sm text-[#5f5668] mb-1">Usuarios Totales</p>
              <p className="text-3xl font-bold text-[#2b2230]">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <p className="text-sm text-[#5f5668] mb-1">Productos</p>
              <p className="text-3xl font-bold text-[#2b2230]">{stats.totalProducts}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <p className="text-sm text-[#5f5668] mb-1">Miembros Black</p>
              <p className="text-3xl font-bold text-[#1a1a2e]">{stats.memberships.black}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <p className="text-sm text-[#5f5668] mb-1">Miembros Pink VIP</p>
              <p className="text-3xl font-bold text-[#e85d95]">{stats.memberships.pink}</p>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-gradient-to-r from-[#f6f1cc] to-[#fef5f8] rounded-2xl p-8 border border-[#fde8ef]">
            <h2 className="text-xl font-serif font-bold text-[#2b2230] mb-3">Panel de Administración PAZ</h2>
            <p className="text-[#5f5668] mb-4">
              Desde acá podés gestionar todo tu sitio:
            </p>
            <ul className="space-y-2 text-sm text-[#5f5668]">
              <li className="flex items-center gap-2">
                <span className="text-[#e85d95] font-bold">&#10003;</span>
                <strong>Productos:</strong> Agregar, editar y eliminar productos con fotos y precios
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#e85d95] font-bold">&#10003;</span>
                <strong>Usuarios:</strong> Ver usuarios registrados, sus membresías y puntos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-300 font-bold">&#9675;</span>
                <strong>Pedidos:</strong> Gestionar compras y envíos (próximamente)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-300 font-bold">&#9675;</span>
                <strong>Promociones:</strong> Crear descuentos y ofertas (próximamente)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-300 font-bold">&#9675;</span>
                <strong>MercadoPago:</strong> Integración de pagos (próximamente)
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
