"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function AdminPage() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    category: "",
    stock: "",
  });
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/products");
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userRaw) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(userRaw);

    if (!user.isAdmin) {
      window.location.href = "/";
      return;
    }

    setAuthorized(true);
    setChecking(false);
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/products",
        {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Product created successfully");
      setForm({
        name: "",
        price: "",
        image: "",
        description: "",
        category: "",
        stock: "",
      });
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product");
    }
  };

  if (checking) {
    return (
      <>
        <Navbar />
        <section className="py-20">
          <div className="container-custom">
            <div className="glass rounded-3xl p-8 text-white/70">
              Checking access...
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (!authorized) return null;

  return (
    <>
      <Navbar />

      <section className="py-16 min-h-screen">
        <div className="container-custom">
          <div className="mb-10">
            <span className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70">
              Admin Dashboard
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight">
              Manage Products
            </h1>
          </div>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
            <div className="glass rounded-[28px] p-6">
              <h2 className="text-2xl font-semibold mb-6">Add Product</h2>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <input
                  type="text"
                  placeholder="Product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3"
                  required
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3"
                  required
                />

                <input
                  type="text"
                  placeholder="Image URL"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3"
                  required
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 min-h-[120px]"
                  required
                />

                <input
                  type="text"
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3"
                />

                <input
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3"
                />

                <button type="submit" className="btn-main w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Product"}
                </button>

                {message && (
                  <p className="text-sm text-white/70 text-center">{message}</p>
                )}
              </form>
            </div>

            <div className="glass rounded-[28px] p-6">
              <h2 className="text-2xl font-semibold mb-6">All Products</h2>

              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-white/60">
                          {product.price} MAD
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="px-4 py-2 rounded-full border border-red-400/30 text-red-300 hover:bg-red-400/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}