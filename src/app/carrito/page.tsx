"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalPoints } = useCart();
  const { user, userData } = useAuth();
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const discount = userData?.membership === "pink" ? 20 : userData?.membership === "yellow" ? 10 : 0;
  const discountAmount = Math.round(totalPrice * discount / 100);
  const finalPrice = totalPrice - discountAmount;

  const handleCheckout = async () => {
    if (!user && (!guestEmail || !guestName)) {
      toast.error("Completá tu email y nombre para continuar");
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, clubPoints: i.clubPoints })),
        totalPrice: finalPrice,
        totalPoints,
        discount,
        discountAmount,
        userId: user?.uid || null,
        guestEmail: user ? userData?.email : guestEmail,
        guestName: user ? userData?.displayName : guestName,
        guestPhone: user ? userData?.phone : guestPhone,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderData) });

      if (!res.ok) {
        const err = await res.json();
        if (err.init_point) {
          window.open(err.init_point as string, "_self");
          return;
        }
        throw new Error(err.error || "Error al procesar el pago");
      }

      const data = await res.json();
      if (data.init_point) {
        window.open(data.init_point as string, "_self");
      } else {
        setOrderComplete(true);
        clearCart();
        toast.success("Pedido registrado");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al procesar el pedido");
    } finally {
      setProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <>
        <Navbar />
        <div className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-[#f6f1cc] to-[#fef5f8]">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <div className="bg-white rounded-3xl shadow-lg p-12 border border-[#fde8ef]">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#2b2230] mb-4">Pedido Registrado</h1>
              <p className="text-[#5f5668] mb-4">Tu pedido fue procesado. Te enviaremos los detalles por email.</p>
              {totalPoints > 0 && (
                <div className="bg-[#fef5f8] rounded-xl p-4 mb-6">
                  <p className="text-[#e85d95] font-bold text-lg">+{totalPoints} puntos Club PAZ obtenidos</p>
                </div>
              )}
              {!user && (
                <div className="bg-[#f6f1cc] rounded-xl p-4 mb-6">
                  <p className="text-[#2b2230] text-sm mb-2">¿Querés guardar tus datos y acumular puntos?</p>
                  <Link href="/registro" className="inline-block bg-gradient-to-r from-[#f285af] to-[#e85d95] text-white px-6 py-2.5 rounded-full text-sm font-semibold">
                    Registrate
                  </Link>
                </div>
              )}
              <Link href="/" className="text-sm text-[#5f5668] hover:text-[#e85d95] transition">
                ← Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-[#f6f1cc] to-[#fef5f8]">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-[#2b2230] mb-8">Carrito</h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-[#fde8ef]">
              <p className="text-[#5f5668] mb-4">Tu carrito está vacío</p>
              <Link href="/#tienda" className="inline-block btn-primary text-white px-8 py-3 rounded-full font-semibold text-sm">
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-md p-4 flex gap-4 items-center border border-[#fde8ef]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl || "/images/productos/producto-1.jpg"} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-[#2b2230]">{item.name}</h3>
                      <p className="text-blush-500 font-semibold">${item.price.toLocaleString()}</p>
                      {item.clubPoints > 0 && (
                        <p className="text-xs text-[#e85d95]">+{item.clubPoints * item.quantity} puntos Club PAZ</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">-</button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition">
                  Vaciar carrito
                </button>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-[#fde8ef] h-fit">
                <h3 className="text-xl font-serif font-bold text-[#2b2230] mb-4">Resumen</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#5f5668]">Subtotal</span>
                    <span className="font-semibold">${totalPrice.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento {discount}% ({userData?.membership})</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-lg font-bold text-[#2b2230]">
                    <span>Total</span>
                    <span>${finalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {totalPoints > 0 && (
                  <div className="bg-[#fef5f8] rounded-xl p-3 mb-4 text-center">
                    <p className="text-sm text-[#e85d95] font-semibold">+{totalPoints} puntos Club PAZ</p>
                  </div>
                )}

                {!user && !showCheckout && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full btn-primary text-white py-3 rounded-full font-semibold text-sm"
                    >
                      Comprar como invitado
                    </button>
                    <Link href="/login" className="block w-full text-center border-2 border-[#e85d95] text-[#e85d95] py-3 rounded-full font-semibold text-sm hover:bg-[#e85d95] hover:text-white transition">
                      Iniciar sesión
                    </Link>
                  </div>
                )}

                {!user && showCheckout && (
                  <div className="space-y-3 mb-4">
                    <input type="text" placeholder="Tu nombre *" value={guestName} onChange={(e) => setGuestName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm" />
                    <input type="email" placeholder="Tu email *" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm" />
                    <input type="tel" placeholder="Tu teléfono" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm" />
                  </div>
                )}

                {(user || showCheckout) && (
                  <button
                    onClick={handleCheckout}
                    disabled={processing}
                    className="w-full btn-primary text-white py-3.5 rounded-full font-semibold text-sm disabled:opacity-50"
                  >
                    {processing ? "Procesando..." : "Pagar con MercadoPago"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
