"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  clubPoints: number;
  active: boolean;
}

export default function TiendaSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      if (!isConfigured || !db) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDocs(collection(db, "products"));
        const prods = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Product))
          .filter((p) => p.active !== false);
        setProducts(prods);
      } catch {
        // Firebase not configured
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      clubPoints: product.clubPoints || 0,
    });
    toast.success(`${product.name} agregado al carrito`);
  };

  const fallbackProducts = [1, 2, 3, 4, 5, 6].map((i) => ({
    id: `fallback-${i}`,
    name: `Producto ${i}`,
    description: "Descripción del producto",
    price: i * 500 + 700,
    imageUrl: `/images/productos/producto-${i}.jpg`,
    clubPoints: Math.floor((i * 500 + 700) / 100),
    active: true,
  }));

  const displayProducts = products.length > 0 ? products : fallbackProducts;

  return (
    <section id="tienda" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="uppercase tracking-[0.3em] text-blush-500 mb-3 text-sm font-semibold">Nuestros Productos</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-5">Tienda <span className="text-blush-400">&hearts;</span></h2>
          <p className="text-muted text-base md:text-lg max-w-2xl mx-auto">
            Explorá nuestra colección exclusiva. Cada producto fue pensado con amor y dedicación.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-[#f285af] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product) => (
              <div key={product.id} className="product-card rounded-[25px] border border-blush-100 bg-white shadow-md overflow-hidden">
                <div className="overflow-hidden aspect-square">
                  <Image src={product.imageUrl || "/images/productos/producto-1.jpg"} alt={product.name} width={400} height={400} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-serif font-semibold mb-2">{product.name}</h3>
                  <p className="text-muted text-sm mb-2">{product.description}</p>
                  {product.clubPoints > 0 && (
                    <p className="text-xs text-[#e85d95] font-semibold mb-3">+{product.clubPoints} puntos Club Hello PAZ</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-blush-500 text-xl font-semibold">${product.price.toLocaleString()}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-primary text-white px-5 py-2 rounded-full text-sm font-semibold"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
