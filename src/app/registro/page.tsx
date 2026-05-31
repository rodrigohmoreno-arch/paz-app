"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("El teléfono es obligatorio");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name, phone);
      toast.success("¡Cuenta creada exitosamente!");
      router.push("/");
    } catch {
      toast.error("Error al crear la cuenta. Probá con otro email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6f1cc] to-[#fef5f8] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/images/logo/logo-paz.jpg" alt="Paz" width={170} height={57} className="mx-auto w-[150px] mb-4" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#2b2230]">Club PAZ Point</h1>
          <p className="text-[#5f5668] mt-2">Suscribite a Club PAZ Point</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[30px] shadow-xl p-8 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#2b2230] mb-2">Nombre</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              className="w-full px-5 py-3.5 rounded-full border border-[#fcd5e3] focus:border-[#f285af] focus:outline-none focus:ring-2 focus:ring-[#fcd5e3] transition text-sm"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#2b2230] mb-2">Teléfono *</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 11 1234-5678"
              required
              className="w-full px-5 py-3.5 rounded-full border border-[#fcd5e3] focus:border-[#f285af] focus:outline-none focus:ring-2 focus:ring-[#fcd5e3] transition text-sm"
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full px-5 py-3.5 rounded-full border border-[#fcd5e3] focus:border-[#f285af] focus:outline-none focus:ring-2 focus:ring-[#fcd5e3] transition text-sm"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2b2230] mb-2">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí tu contraseña"
              required
              className="w-full px-5 py-3.5 rounded-full border border-[#fcd5e3] focus:border-[#f285af] focus:outline-none focus:ring-2 focus:ring-[#fcd5e3] transition text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-white py-3.5 rounded-full font-semibold text-base disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#5f5668]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-[#e85d95] font-semibold hover:underline">
            Iniciar Sesión
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
