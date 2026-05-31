"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";
import toast from "react-hot-toast";

interface SymbolPrize {
  emoji: string;
  discount: number;
  points: number;
  label: string;
}

interface SlotConfig {
  symbols: SymbolPrize[];
  participationPoints: number;
}

const DEFAULT_CONFIG: SlotConfig = {
  symbols: [
    { emoji: "🌸", discount: 15, points: 200, label: "PREMIO" },
    { emoji: "💎", discount: 50, points: 1000, label: "JACKPOT" },
    { emoji: "🎀", discount: 20, points: 300, label: "GRAN PREMIO" },
    { emoji: "⭐", discount: 10, points: 150, label: "PREMIO" },
    { emoji: "💝", discount: 25, points: 400, label: "GRAN PREMIO" },
    { emoji: "🦩", discount: 30, points: 500, label: "MEGA PREMIO" },
    { emoji: "👑", discount: 40, points: 800, label: "JACKPOT" },
    { emoji: "🌺", discount: 15, points: 200, label: "PREMIO" },
  ],
  participationPoints: 5,
};

export default function AdminSlotConfig() {
  const [config, setConfig] = useState<SlotConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isConfigured || !db) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "config", "slotConfig"));
        if (snap.exists()) {
          setConfig(snap.data() as SlotConfig);
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    if (!db) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "config", "slotConfig"), config);
      toast.success("Configuración del slot guardada");
    } catch {
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  }

  function updateSymbol(index: number, field: keyof SymbolPrize, value: string | number) {
    setConfig((prev) => {
      const updated = { ...prev, symbols: [...prev.symbols] };
      updated.symbols[index] = { ...updated.symbols[index], [field]: value };
      return updated;
    });
  }

  function removeSymbol(index: number) {
    if (config.symbols.length <= 3) {
      toast.error("Necesitás al menos 3 símbolos");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      symbols: prev.symbols.filter((_, i) => i !== index),
    }));
  }

  function addSymbol() {
    setConfig((prev) => ({
      ...prev,
      symbols: [...prev.symbols, { emoji: "🎁", discount: 10, points: 100, label: "PREMIO" }],
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#5f5668]">
        <div className="w-5 h-5 border-2 border-[#f285af] border-t-transparent rounded-full animate-spin" />
        Cargando configuración...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2b2230]">Configuración del Slot</h1>
          <p className="text-sm text-[#5f5668] mt-1">Configurá los premios de Club Hello PAZ</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-white px-6 py-3 rounded-full font-semibold text-sm disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
        <h2 className="text-lg font-serif font-bold text-[#2b2230] mb-4">Configuración General</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#5f5668]">Puntos por participación (sin premio)</label>
            <input
              type="number"
              value={config.participationPoints}
              onChange={(e) => setConfig((prev) => ({ ...prev, participationPoints: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#5f5668]">Total de símbolos</label>
            <p className="text-2xl font-bold text-[#2b2230] py-2">{config.symbols.length}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-r from-[#f6f1cc] to-[#fef5f8] rounded-2xl p-6 border border-[#fde8ef] mb-6">
        <h3 className="font-semibold text-[#2b2230] mb-2">¿Cómo funciona?</h3>
        <ul className="text-sm text-[#5f5668] space-y-1">
          <li>• El slot tiene una grilla de <strong>3×3</strong> con <strong>5 líneas</strong> ganadoras (3 horizontales + 2 diagonales)</li>
          <li>• Cuando 3 símbolos iguales caen en una línea, el usuario gana el premio configurado para ese símbolo</li>
          <li>• Si no hay línea ganadora, el usuario recibe los <strong>puntos de participación</strong></li>
          <li>• Los premios de descuento generan un <strong>cupón único</strong> válido por 7 días</li>
        </ul>
      </div>

      {/* Symbols */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-[#2b2230]">Premios por Símbolo</h2>
          <button
            onClick={addSymbol}
            className="text-sm font-semibold text-[#e85d95] hover:text-[#d43d78] transition"
          >
            + Agregar símbolo
          </button>
        </div>

        {config.symbols.map((sym, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <div className="grid sm:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium mb-1 text-[#5f5668]">Emoji</label>
                <input
                  type="text"
                  value={sym.emoji}
                  onChange={(e) => updateSymbol(i, "emoji", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-2xl text-center"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#5f5668]">Descuento %</label>
                <input
                  type="number"
                  value={sym.discount}
                  onChange={(e) => updateSymbol(i, "discount", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#5f5668]">Puntos</label>
                <input
                  type="number"
                  value={sym.points}
                  onChange={(e) => updateSymbol(i, "points", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#5f5668]">Etiqueta</label>
                <input
                  type="text"
                  value={sym.label}
                  onChange={(e) => updateSymbol(i, "label", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => removeSymbol(i)}
                  className="text-gray-400 hover:text-red-500 transition p-2"
                  title="Eliminar símbolo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-white px-8 py-3.5 rounded-full font-semibold text-sm disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
