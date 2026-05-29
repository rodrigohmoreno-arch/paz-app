"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("¡Bienvenido/a!");
      router.push("/");
    } catch {
      toast.error("Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6f1cc] to-[#fef5f8] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/images/logo/logo-paz.jpg" alt="Paz" width={170} height={57} className="mx-auto w-[150px] mb-4" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#2b2230]">Iniciar Sesión</h1>
          <p className="text-[#5f5668] mt-2">Ingresá a tu cuenta PAZ</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[30px] shadow-xl p-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2b2230] mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-5 py-3.5 rounded-full border border-[#fcd5e3] focus:border-[#f285af] focus:outline-none focus:ring-2 focus:ring-[#fcd5e3] transition text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2b2230] mb-2">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              className="w-full px-5 py-3.5 rounded-full border border-[#fcd5e3] focus:border-[#f285af] focus:outline-none focus:ring-2 focus:ring-[#fcd5e3] transition text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-white py-3.5 rounded-full font-semibold text-base disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#5f5668]">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-[#e85d95] font-semibold hover:underline">
            Registrate
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-sm text-[#5f5668] hover:text-[#e85d95] transition">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
