import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClubPazPoints from "@/components/ClubPazPoints";
import TiendaSection from "@/components/TiendaSection";
import MembershipsSection from "@/components/MembershipsSection";

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
      <MembershipsSection />

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
