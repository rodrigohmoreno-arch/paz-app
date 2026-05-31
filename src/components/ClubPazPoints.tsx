"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const SYMBOLS = ["🌸", "💎", "🎀", "⭐", "💝", "🦩", "👑", "🌺"];
const REEL_COUNT = 3;
const SPIN_DURATION = 2000;

interface Prize {
  label: string;
  description: string;
  type: "jackpot" | "big" | "small" | "none";
}

function getRandomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function determinePrize(results: string[]): Prize {
  if (results[0] === results[1] && results[1] === results[2]) {
    if (results[0] === "💎") return { label: "JACKPOT", description: "50% de descuento en tu próxima compra", type: "jackpot" };
    if (results[0] === "👑") return { label: "JACKPOT", description: "Producto gratis a elección", type: "jackpot" };
    return { label: "GRAN PREMIO", description: "30% de descuento + 500 puntos Club Hello PAZ", type: "big" };
  }
  if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
    return { label: "PREMIO", description: "10% de descuento + 100 puntos Club Hello PAZ", type: "small" };
  }
  return { label: "Seguí intentando", description: "+10 puntos Club Hello PAZ por participar", type: "none" };
}

export default function ClubPazPoints() {
  const { user, userData } = useAuth();
  const [reels, setReels] = useState<string[]>(["🌸", "💎", "🎀"]);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [animatingReels, setAnimatingReels] = useState<boolean[]>([false, false, false]);

  const hasMembership = user && userData && userData.membership !== "none";

  const monthlySpins: Record<string, number> = {
    white: 15,
    yellow: 30,
    pink: 60,
  };

  const spinsAllowed = userData?.membership ? monthlySpins[userData.membership] || 0 : 0;

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setPrize(null);
    setAnimatingReels([true, true, true]);

    const finalResults = Array.from({ length: REEL_COUNT }, () => getRandomSymbol());

    const intervalIds: ReturnType<typeof setInterval>[] = [];
    for (let i = 0; i < REEL_COUNT; i++) {
      intervalIds.push(
        setInterval(() => {
          setReels((prev) => {
            const copy = [...prev];
            copy[i] = getRandomSymbol();
            return copy;
          });
        }, 80 + i * 20)
      );
    }

    for (let i = 0; i < REEL_COUNT; i++) {
      setTimeout(() => {
        clearInterval(intervalIds[i]);
        setReels((prev) => {
          const copy = [...prev];
          copy[i] = finalResults[i];
          return copy;
        });
        setAnimatingReels((prev) => {
          const copy = [...prev];
          copy[i] = false;
          return copy;
        });

        if (i === REEL_COUNT - 1) {
          setTimeout(() => {
            setPrize(determinePrize(finalResults));
            setSpinning(false);
          }, 300);
        }
      }, SPIN_DURATION + i * 500);
    }
  }, [spinning]);

  const prizeColors: Record<string, string> = {
    jackpot: "from-yellow-400 to-amber-500",
    big: "from-[#f285af] to-[#e85d95]",
    small: "from-purple-400 to-purple-600",
    none: "from-gray-400 to-gray-500",
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-gradient-to-b from-[#2b2230] to-[#1a1a2e] rounded-[30px] p-6 md:p-10 shadow-2xl w-full max-w-md text-center">
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
        <div className="bg-gradient-to-b from-[#2b2230] to-[#1a1a2e] rounded-[30px] p-6 md:p-10 shadow-2xl w-full max-w-md text-center">
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

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-b from-[#2b2230] to-[#1a1a2e] rounded-[30px] p-6 md:p-10 shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">CLUB HELLO PAZ</h3>
          <div className="w-20 h-[2px] bg-gradient-to-r from-[#f285af] to-[#e85d95] mx-auto rounded-full mb-2" />
          <p className="text-gray-400 text-xs">{spinsAllowed} giros/mes con tu membresía {userData?.membership?.toUpperCase()}</p>
        </div>

        <div className="flex justify-center gap-3 md:gap-4 mb-6">
          {reels.map((symbol, i) => (
            <div
              key={i}
              className={`
                w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 border-2 border-white/20
                flex items-center justify-center text-4xl md:text-5xl
                shadow-inner backdrop-blur-sm
                ${animatingReels[i] ? "animate-pulse" : ""}
                transition-all duration-300
              `}
            >
              <span className={animatingReels[i] ? "animate-bounce" : ""}>{symbol}</span>
            </div>
          ))}
        </div>

        <button
          onClick={spin}
          disabled={spinning}
          className={`
            w-full py-4 rounded-full font-bold text-base md:text-lg tracking-wide
            transition-all duration-300 shadow-xl
            ${spinning
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-[#f285af] to-[#e85d95] text-white hover:scale-105 hover:shadow-2xl active:scale-95"
            }
          `}
        >
          {spinning ? "Girando..." : "GIRAR"}
        </button>
      </div>

      {prize && (
        <div className={`mt-6 w-full max-w-md rounded-2xl p-5 text-center text-white bg-gradient-to-r ${prizeColors[prize.type]} shadow-lg animate-fade-in`}>
          <p className="text-xl md:text-2xl font-bold mb-1">{prize.label}</p>
          <p className="text-sm md:text-base opacity-90">{prize.description}</p>
        </div>
      )}
    </div>
  );
}
