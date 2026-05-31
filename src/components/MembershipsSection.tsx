"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const TIERS = [
  { key: "white", name: "Friend", level: 1 },
  { key: "yellow", name: "Bestie", level: 2 },
  { key: "pink", name: "BBF", level: 3 },
];

export default function MembershipsSection() {
  const { user, userData, loading } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const hasMembership = user && userData && userData.membership !== "none";
  const currentTier = TIERS.find((t) => t.key === userData?.membership);
  const higherTiers = currentTier ? TIERS.filter((t) => t.level > currentTier.level) : TIERS;

  if (loading) return null;

  if (hasMembership && !showUpgrade) {
    return (
      <section id="membresias" className="py-12 md:py-16 bg-gradient-to-b from-cream to-blush-50">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-[#fde8ef]">
            <p className="text-sm text-[#5f5668] mb-2">Tu membresía actual</p>
            <h3 className="text-2xl font-serif font-bold text-[#2b2230] mb-4">{currentTier?.name || userData?.membership}</h3>
            {higherTiers.length > 0 && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="inline-block bg-gradient-to-r from-[#f285af] to-[#e85d95] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition"
              >
                Mejorar Membresía
              </button>
            )}
            {higherTiers.length === 0 && (
              <p className="text-sm text-[#e85d95] font-semibold">¡Tenés el nivel máximo!</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (hasMembership && showUpgrade) {
    return (
      <section id="membresias" className="py-20 md:py-28 bg-gradient-to-b from-cream to-blush-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="uppercase tracking-[0.3em] text-blush-500 mb-3 text-sm font-semibold">Mejorar nivel</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-5">
            Subí tu Membresía <span className="text-blush-400">&hearts;</span>
          </h2>
          <p className="text-muted text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Tu membresía actual: <strong>{currentTier?.name}</strong>. Pasá al siguiente nivel.
          </p>
          <button
            onClick={() => setShowUpgrade(false)}
            className="text-sm text-[#5f5668] hover:text-[#e85d95] transition mb-10 inline-block"
          >
            ← Volver
          </button>

          <div className={`grid gap-8 lg:gap-10 items-end ${higherTiers.length === 1 ? "max-w-md mx-auto" : "md:grid-cols-2 max-w-3xl mx-auto"}`}>
            {higherTiers.map((tier) => {
              if (tier.key === "yellow") return <BestieCard key={tier.key} />;
              if (tier.key === "pink") return <BBFCard key={tier.key} />;
              return null;
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="membresias" className="py-20 md:py-28 bg-gradient-to-b from-cream to-blush-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="uppercase tracking-[0.3em] text-blush-500 mb-3 text-sm font-semibold">Elegí tu nivel</p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-5">
          Membresías PAZ <span className="text-blush-400">&hearts;</span>
        </h2>
        <p className="text-muted text-base md:text-lg mb-14 max-w-2xl mx-auto">
          Suscribite y empezá a disfrutar de beneficios exclusivos. Pago mensual.
        </p>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 items-end">
          <FriendCard />
          <BestieCard />
          <BBFCard />
        </div>
      </div>
    </section>
  );
}

function FriendCard() {
  return (
    <div className="membership-card rounded-[30px] border border-gray-200 bg-white shadow-lg p-8 md:p-10">
      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-50 to-gray-200 border-2 border-gray-200 shadow-inner flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
      </div>
      <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-2 text-gray-700">Friend</h3>
      <p className="text-sm text-muted mb-4">Nivel Básico</p>
      <div className="text-gray-600 text-3xl md:text-4xl font-light mb-6">$0 <span className="text-base text-muted">/mes</span></div>
      <ul className="space-y-3 text-left text-muted mb-8 text-sm">
        <li className="flex items-center gap-2"><span className="text-gray-400 font-bold">&#10003;</span> Acceso a la tienda</li>
        <li className="flex items-center gap-2"><span className="text-gray-400 font-bold">&#10003;</span> Acumula puntos en compras web y físicas</li>
        <li className="flex items-center gap-2"><span className="text-gray-400 font-bold">&#10003;</span> 15 giros de Club Hello PAZ por mes</li>
        <li className="flex items-center gap-2"><span className="text-gray-400 font-bold">&#10003;</span> Canjeo de puntos por mercadería</li>
      </ul>
      <button className="w-full border-2 border-[#1a1a2e] text-[#1a1a2e] rounded-full py-3 text-sm font-semibold hover:bg-[#1a1a2e] hover:text-white transition">Comenzar Gratis</button>
    </div>
  );
}

function BestieCard() {
  return (
    <div className="membership-card rounded-[30px] bg-[#faebc8] border border-[#f0d99a] text-[#2b2230] shadow-2xl p-8 md:p-10 md:py-12 relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2b2230] text-white text-xs font-bold px-4 py-1 rounded-full tracking-wider shadow-md">RECOMENDADO</div>
      <div className="w-16 h-16 mx-auto rounded-full bg-[#f0d99a]/50 border-2 border-[#f0d99a] shadow-inner flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-[#c9a84c]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
      </div>
      <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-2">Bestie</h3>
      <p className="text-sm text-[#5f5668] mb-4">Nivel Premium</p>
      <div className="text-[#2b2230] text-3xl md:text-4xl font-light mb-6">$2.500 <span className="text-base text-[#5f5668]">/mes</span></div>
      <ul className="space-y-3 text-left text-[#5f5668] mb-8 text-sm">
        <li className="flex items-center gap-2"><span className="text-[#c9a84c] font-bold">&#10003;</span> Todo lo de Friend</li>
        <li className="flex items-center gap-2"><span className="text-[#c9a84c] font-bold">&#10003;</span> 10% de descuento en todas las compras</li>
        <li className="flex items-center gap-2"><span className="text-[#c9a84c] font-bold">&#10003;</span> 30 giros de Club Hello PAZ por mes</li>
        <li className="flex items-center gap-2"><span className="text-[#c9a84c] font-bold">&#10003;</span> Ofertas exclusivas vía newsletter</li>
      </ul>
      <button className="w-full bg-[#2b2230] text-white rounded-full py-3.5 text-sm font-bold hover:bg-[#3d2f44] transition">Elegir Bestie</button>
    </div>
  );
}

function BBFCard() {
  return (
    <div className="membership-card rounded-[30px] bg-[#fde8ef] border border-[#fcd5e3] text-[#2b2230] shadow-2xl p-8 md:p-10 md:py-14 relative">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2b2230] text-white text-xs font-bold px-5 py-1.5 rounded-full tracking-wider shadow-lg flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        VIP
      </div>
      <div className="w-16 h-16 mx-auto rounded-full bg-[#f9adc9]/30 border-2 border-[#f9adc9] shadow-inner flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-[#e85d95]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
      </div>
      <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-2">BBF</h3>
      <p className="text-sm text-[#5f5668] mb-4">Nivel VIP Exclusivo</p>
      <div className="text-[#2b2230] text-3xl md:text-4xl font-light mb-6">$5.000 <span className="text-base text-[#5f5668]">/mes</span></div>
      <ul className="space-y-3 text-left text-[#5f5668] mb-8 text-sm">
        <li className="flex items-center gap-2"><span className="text-[#e85d95] font-bold">&#10003;</span> Todo lo de Bestie</li>
        <li className="flex items-center gap-2"><span className="text-[#e85d95] font-bold">&#10003;</span> 20% de descuento en todas las compras</li>
        <li className="flex items-center gap-2"><span className="text-[#e85d95] font-bold">&#10003;</span> 60 giros de Club Hello PAZ por mes</li>
        <li className="flex items-center gap-2"><span className="text-[#e85d95] font-bold">&#10003;</span> Sorteo exclusivo de fin de año</li>
        <li className="flex items-center gap-2"><span className="text-[#e85d95] font-bold">&#10003;</span> Puntos adicionales en compras físicas</li>
      </ul>
      <button className="w-full bg-[#2b2230] text-white rounded-full py-3.5 text-sm font-bold hover:bg-[#3d2f44] transition shadow-lg">Elegir BBF</button>
    </div>
  );
}
