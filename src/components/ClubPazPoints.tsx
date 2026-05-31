"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, updateDoc, increment, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

const GRID_ROWS = 3;
const GRID_COLS = 3;
const SPIN_DURATION = 1800;

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

interface SpinResult {
  type: "jackpot" | "big" | "small" | "none";
  label: string;
  description: string;
  discount: number;
  points: number;
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

const LINES: [number, number][][] = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[2, 0], [1, 1], [0, 2]],
];

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PAZ-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function makeGrid(symbols: string[]): string[][] {
  const pick = () => symbols[Math.floor(Math.random() * symbols.length)];
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, pick)
  );
}

export default function ClubPazPoints() {
  const { user, userData, refreshUserData } = useAuth();
  const [grid, setGrid] = useState<string[][]>([
    ["🌸", "💎", "🎀"],
    ["⭐", "💝", "🦩"],
    ["👑", "🌺", "🌸"],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [animatingCols, setAnimatingCols] = useState<boolean[]>([false, false, false]);
  const [slotConfig, setSlotConfig] = useState<SlotConfig>(DEFAULT_CONFIG);
  const [winningCells, setWinningCells] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const configRef = useRef<SlotConfig>(DEFAULT_CONFIG);

  const hasMembership = user && userData && userData.membership !== "none";

  const monthlySpins: Record<string, number> = {
    white: 15,
    yellow: 30,
    pink: 60,
  };

  const spinsAllowed = userData?.membership ? monthlySpins[userData.membership] || 0 : 0;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const spinsUsedThisMonth = userData?.spinsResetMonth === currentMonth ? (userData?.spinsUsed || 0) : 0;
  const spinsRemaining = Math.max(0, spinsAllowed - spinsUsedThisMonth);

  useEffect(() => {
    async function loadConfig() {
      if (!db) return;
      try {
        const configDoc = await getDoc(doc(db, "config", "slotConfig"));
        if (configDoc.exists()) {
          const data = configDoc.data() as SlotConfig;
          setSlotConfig(data);
          configRef.current = data;
        }
      } catch {
        // Use defaults
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    configRef.current = slotConfig;
  }, [slotConfig]);

  const evaluateSpin = useCallback((finalGrid: string[][]): { result: SpinResult; cells: string[] } => {
    const cfg = configRef.current;
    let bestDiscount = 0;
    let bestResult: SpinResult | null = null;
    let bestCells: string[] = [];

    for (const line of LINES) {
      const s0 = finalGrid[line[0][0]][line[0][1]];
      const s1 = finalGrid[line[1][0]][line[1][1]];
      const s2 = finalGrid[line[2][0]][line[2][1]];

      if (s0 === s1 && s1 === s2) {
        const sym = cfg.symbols.find((s) => s.emoji === s0);
        if (sym && sym.discount > bestDiscount) {
          bestDiscount = sym.discount;
          bestResult = {
            type: sym.discount >= 40 ? "jackpot" : sym.discount >= 20 ? "big" : "small",
            label: sym.label,
            description: `${sym.discount}% de descuento + ${sym.points} puntos`,
            discount: sym.discount,
            points: sym.points,
          };
          bestCells = line.map(([r, c]) => `${r}-${c}`);
        }
      }
    }

    if (bestResult) {
      return { result: bestResult, cells: bestCells };
    }

    return {
      result: {
        type: "none",
        label: "Seguí intentando",
        description: `+${cfg.participationPoints} puntos por participar`,
        discount: 0,
        points: cfg.participationPoints,
      },
      cells: [],
    };
  }, []);

  const spin = useCallback(async () => {
    if (spinning || !user || !userData || !db) return;

    if (spinsRemaining <= 0) {
      toast.error("No te quedan giros este mes");
      return;
    }

    setSpinning(true);
    setResult(null);
    setCouponCode(null);
    setWinningCells([]);
    setAnimatingCols([true, true, true]);

    const symbols = configRef.current.symbols.map((s) => s.emoji);
    const finalGrid = makeGrid(symbols);

    const intervalIds: ReturnType<typeof setInterval>[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      intervalIds.push(
        setInterval(() => {
          setGrid((prev) => {
            const copy = prev.map((row) => [...row]);
            for (let r = 0; r < GRID_ROWS; r++) {
              copy[r][c] = symbols[Math.floor(Math.random() * symbols.length)];
            }
            return copy;
          });
        }, 60 + c * 15)
      );
    }

    for (let c = 0; c < GRID_COLS; c++) {
      setTimeout(() => {
        clearInterval(intervalIds[c]);
        setGrid((prev) => {
          const copy = prev.map((row) => [...row]);
          for (let r = 0; r < GRID_ROWS; r++) {
            copy[r][c] = finalGrid[r][c];
          }
          return copy;
        });
        setAnimatingCols((prev) => {
          const copy = [...prev];
          copy[c] = false;
          return copy;
        });

        if (c === GRID_COLS - 1) {
          setTimeout(async () => {
            const { result: spinResult, cells } = evaluateSpin(finalGrid);
            setResult(spinResult);
            setWinningCells(cells);

            try {
              if (!db) throw new Error("DB not configured");
              const userRef = doc(db, "users", user.uid);

              if (userData.spinsResetMonth !== currentMonth) {
                await updateDoc(userRef, {
                  spinsUsed: 1,
                  spinsResetMonth: currentMonth,
                  points: increment(spinResult.points),
                });
              } else {
                await updateDoc(userRef, {
                  spinsUsed: increment(1),
                  points: increment(spinResult.points),
                });
              }

              if (spinResult.discount > 0) {
                const code = generateCouponCode();
                const now = new Date();
                const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                await addDoc(collection(db, "coupons"), {
                  userId: user.uid,
                  userEmail: userData.email,
                  userName: userData.displayName,
                  code,
                  discount: spinResult.discount,
                  label: spinResult.label,
                  status: "active",
                  createdAt: now.toISOString(),
                  expiresAt: expiresAt.toISOString(),
                });

                setCouponCode(code);
                toast.success(`¡Ganaste un cupón de ${spinResult.discount}% de descuento!`);
              }

              await refreshUserData();
            } catch (err) {
              console.error("Error saving spin:", err);
            }

            setSpinning(false);
          }, 400);
        }
      }, SPIN_DURATION + c * 600);
    }
  }, [spinning, user, userData, spinsRemaining, currentMonth, evaluateSpin, refreshUserData]);

  const resultColors: Record<string, string> = {
    jackpot: "from-yellow-400 to-amber-500",
    big: "from-[#f285af] to-[#e85d95]",
    small: "from-purple-400 to-purple-600",
    none: "from-gray-400 to-gray-500",
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-gradient-to-b from-[#2b2230] to-[#1a1a2e] rounded-[30px] p-6 md:p-10 shadow-2xl w-full max-w-lg text-center">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">CLUB HELLO PAZ</h3>
          <div className="w-20 h-[2px] bg-gradient-to-r from-[#f285af] to-[#e85d95] mx-auto rounded-full mb-6" />
          <p className="text-gray-300 text-sm mb-6">Registrate y suscribite a una membresía para acceder a los giros de Club Hello PAZ.</p>
          <Link href="/registro" className="inline-block bg-gradient-to-r from-[#f285af] to-[#e85d95] text-white px-8 py-3 rounded-full font-semibold text-sm hover:scale-105 transition">
            Registrate
          </Link>
        </div>
      </div>
    );
  }

  if (!hasMembership) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-gradient-to-b from-[#2b2230] to-[#1a1a2e] rounded-[30px] p-6 md:p-10 shadow-2xl w-full max-w-lg text-center">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">CLUB HELLO PAZ</h3>
          <div className="w-20 h-[2px] bg-gradient-to-r from-[#f285af] to-[#e85d95] mx-auto rounded-full mb-6" />
          <p className="text-gray-300 text-sm mb-6">Necesitás una membresía activa para acceder a los giros de Club Hello PAZ.</p>
          <Link href="/#membresias" className="inline-block bg-gradient-to-r from-[#f285af] to-[#e85d95] text-white px-8 py-3 rounded-full font-semibold text-sm hover:scale-105 transition">
            Ver Membresías
          </Link>
        </div>
      </div>
    );
  }

  const membershipLabel = userData?.membership === "white" ? "FRIEND" : userData?.membership === "yellow" ? "BESTIE" : userData?.membership === "pink" ? "BBF" : "";

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-b from-[#2b2230] to-[#1a1a2e] rounded-[30px] p-6 md:p-10 shadow-2xl w-full max-w-lg">
        <div className="text-center mb-4">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">CLUB HELLO PAZ</h3>
          <div className="w-20 h-[2px] bg-gradient-to-r from-[#f285af] to-[#e85d95] mx-auto rounded-full mb-2" />
          <p className="text-gray-400 text-xs">{spinsAllowed} giros/mes con tu membresía {membershipLabel}</p>
        </div>

        {/* Line indicators */}
        <div className="flex justify-center gap-1 mb-3">
          {LINES.map((_, i) => (
            <div key={i} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
              L{i + 1}
            </div>
          ))}
          <div className="text-[10px] text-gray-400 ml-1 py-0.5">5 líneas</div>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-rows-3 gap-2 mb-4 max-w-[280px] md:max-w-[320px] mx-auto">
          {grid.map((row, r) => (
            <div key={r} className="grid grid-cols-3 gap-2">
              {row.map((symbol, c) => {
                const cellKey = `${r}-${c}`;
                const isWinner = winningCells.includes(cellKey);
                return (
                  <div
                    key={cellKey}
                    className={`
                      w-[80px] h-[80px] md:w-[96px] md:h-[96px] rounded-2xl
                      flex items-center justify-center text-3xl md:text-4xl
                      shadow-inner backdrop-blur-sm transition-all duration-300
                      ${isWinner
                        ? "bg-gradient-to-br from-yellow-400/30 to-amber-500/30 border-2 border-yellow-400 scale-110"
                        : "bg-white/10 border-2 border-white/20"
                      }
                      ${animatingCols[c] ? "animate-pulse" : ""}
                    `}
                  >
                    <span className={animatingCols[c] ? "animate-bounce" : isWinner ? "animate-pulse" : ""}>
                      {symbol}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Spins remaining */}
        <div className="flex justify-between items-center mb-4 px-2">
          <p className="text-gray-400 text-xs">Giros restantes</p>
          <p className="text-white font-bold text-lg">{spinning ? spinsRemaining - 1 : spinsRemaining} / {spinsAllowed}</p>
        </div>

        <button
          onClick={spin}
          disabled={spinning || spinsRemaining <= 0}
          className={`
            w-full py-4 rounded-full font-bold text-base md:text-lg tracking-wide
            transition-all duration-300 shadow-xl
            ${spinning || spinsRemaining <= 0
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-[#f285af] to-[#e85d95] text-white hover:scale-105 hover:shadow-2xl active:scale-95"
            }
          `}
        >
          {spinning ? "Girando..." : spinsRemaining <= 0 ? "Sin giros este mes" : "GIRAR"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`mt-6 w-full max-w-lg rounded-2xl p-5 text-center text-white bg-gradient-to-r ${resultColors[result.type]} shadow-lg animate-fade-in`}>
          <p className="text-xl md:text-2xl font-bold mb-1">{result.label}</p>
          <p className="text-sm md:text-base opacity-90">{result.description}</p>
          {couponCode && (
            <div className="mt-3 bg-white/20 rounded-xl p-3">
              <p className="text-xs opacity-80 mb-1">Tu código de descuento (válido 7 días):</p>
              <p className="text-lg font-mono font-bold tracking-wider">{couponCode}</p>
              <p className="text-xs opacity-70 mt-1">Usalo en tu próxima compra online o en tienda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
