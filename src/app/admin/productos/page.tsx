"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, isConfigured } from "@/lib/firebase";
import Image from "next/image";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
  createdAt: string;
}

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", imageUrl: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }
    try {
      const snap = await getDocs(collection(db, "products"));
      const prods = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      prods.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setProducts(prods);
    } catch {
      // Firebase not configured
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadImage(file: File): Promise<string> {
    if (!storage) throw new Error("Storage no configurado");
    const storageRef = ref(storage, `productos/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async function handleSave() {
    if (!db) {
      toast.error("Firebase no configurado");
      return;
    }
    if (!formData.name || !formData.price) {
      toast.error("Nombre y precio son obligatorios");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        imageUrl = await handleUploadImage(imageFile);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl,
        active: true,
        createdAt: editingId ? formData.imageUrl : new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db!, "products", editingId), productData);
        toast.success("Producto actualizado");
      } else {
        productData.createdAt = new Date().toISOString();
        await addDoc(collection(db!, "products"), productData);
        toast.success("Producto creado");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", description: "", price: "", imageUrl: "" });
      setImageFile(null);
      fetchProducts();
    } catch {
      toast.error("Error al guardar. Verificá la configuración de Firebase.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;
    if (!db) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Producto eliminado");
      fetchProducts();
    } catch {
      toast.error("Error al eliminar");
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
    });
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#2b2230]">Productos</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", description: "", price: "", imageUrl: "" });
          }}
          className="btn-primary text-white px-6 py-3 rounded-full text-sm font-semibold"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-serif font-bold mb-6">
              {editingId ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm"
                  placeholder="Nombre del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm resize-none"
                  rows={3}
                  placeholder="Descripción del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f285af] focus:outline-none text-sm"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Foto del producto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fef5f8] file:text-[#e85d95] hover:file:bg-[#fde8ef]"
                />
                {formData.imageUrl && !imageFile && (
                  <div className="mt-2">
                    <Image src={formData.imageUrl} alt="Preview" width={100} height={100} className="w-20 h-20 object-cover rounded-xl" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="flex items-center gap-2 text-[#5f5668]">
          <div className="w-5 h-5 border-2 border-[#f285af] border-t-transparent rounded-full animate-spin" />
          Cargando productos...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-100">
          <p className="text-[#5f5668] mb-4">No hay productos todavía</p>
          <p className="text-sm text-gray-400 mb-6">
            Hacé clic en &quot;+ Nuevo Producto&quot; para agregar tu primer producto.
            <br />
            <span className="text-[#e85d95]">Nota:</span> Necesitás configurar Firebase primero.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              {product.imageUrl && (
                <div className="aspect-square">
                  <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-semibold text-[#2b2230] mb-1">{product.name}</h3>
                <p className="text-sm text-[#5f5668] mb-3">{product.description}</p>
                <p className="text-xl font-bold text-[#e85d95] mb-4">${product.price.toLocaleString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(product)} className="flex-1 text-sm py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition font-medium">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-sm py-2 px-4 rounded-full text-red-500 hover:bg-red-50 transition font-medium">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
