import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClubPazPoints from "@/components/ClubPazPoints";
import TiendaSection from "@/components/TiendaSection";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section id="inicio" className="pt-32 md:pt-40 pb-20 md:pb-28 hero-gradient overflow-hidden relative">
        <div className="absolute right-0 bottom-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blush-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute left-[-100px] top-[100px] w-[250px] h-[250px] bg-blush-200 rounded-full blur-3xl opacity-30" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-12 lg:gap-16 relative z-10">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-none mb-6 text-plum">
              La magia está<br />en los detalles
            </h1>
            <div className="w-32 h-[3px] bg-gradient-to-r from-blush-400 to-blush-500 mb-6 rounded-full" />
            <p className="text-muted text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              Descubrí un mundo de estilo, diversión y recompensas exclusivas. Tu experiencia premium comienza aquí.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/#tienda" className="btn-primary text-white px-8 py-4 rounded-full shadow-xl text-base font-semibold inline-block">
                Comprar Ahora
              </Link>
              <Link href="/#membresias" className="btn-outline px-8 py-4 rounded-full text-base font-semibold inline-block">
                Ver Membresías
              </Link>
            </div>
          </div>
          <div className="flex justify-center relative">
            <div className="absolute w-[320px] md:w-[420px] h-[320px] md:h-[420px] bg-blush-100 rounded-full blur-3xl opacity-40" />
            <Image src="/images/general/flamenco.png" alt="Flamenco Paz" width={480} height={640} className="relative z-10 w-[320px] md:w-[420px] lg:w-[480px] max-w-full object-contain float-animation rounded-[30px] drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* TIENDA */}
      <TiendaSection />

      {/* MEMBRESIAS PAZ */}
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
            {/* Friend */}
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

            {/* Bestie */}
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

            {/* BBF */}
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
          </div>
        </div>
      </section>

      {/* CLUB HELLO PAZ */}
      <section id="club-paz-points" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-[35px] md:rounded-[40px] bg-olive border border-blush-100 shadow-2xl p-8 md:p-14 grid lg:grid-cols-2 items-center gap-10">
            <div>
              <p className="uppercase tracking-[0.3em] text-blush-500 mb-4 text-sm font-semibold">Jugá y ganá</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-5">CLUB HELLO PAZ</h2>
              <p className="text-muted text-base md:text-lg leading-relaxed mb-4">
                Suscribite al Club Hello PAZ y obtené beneficios.
              </p>
              <p className="text-muted text-sm leading-relaxed mb-8">
                Cada membresía incluye giros mensuales (no acumulables). Girá y ganá descuentos, premios y puntos para canjear por mercadería.
              </p>
            </div>
            <ClubPazPoints />
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-20 md:py-28 bg-gradient-to-b from-blush-50 to-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="uppercase tracking-[0.3em] text-blush-500 mb-3 text-sm font-semibold">Contacto</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-5">¿Tenés alguna consulta?</h2>
          <p className="text-muted text-base md:text-lg mb-10 max-w-xl mx-auto">
            Estamos acá para ayudarte. Escribinos y te respondemos lo antes posible.
          </p>
          <div className="max-w-lg mx-auto space-y-4 mb-8">
            <input type="text" placeholder="Tu nombre" className="w-full px-6 py-4 rounded-full border border-blush-200 focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200 transition bg-white text-sm" />
            <input type="email" placeholder="Tu email" className="w-full px-6 py-4 rounded-full border border-blush-200 focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200 transition bg-white text-sm" />
            <textarea placeholder="Tu mensaje..." rows={4} className="w-full px-6 py-4 rounded-[20px] border border-blush-200 focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200 transition bg-white text-sm resize-none" />
          </div>
          <button className="btn-primary text-white px-10 py-4 rounded-full shadow-xl text-base font-semibold">Enviar Mensaje</button>
        </div>
      </section>

      <Footer />
    </>
  );
}
