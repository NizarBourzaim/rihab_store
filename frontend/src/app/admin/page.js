"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import API_URL from "../../utils/api";
import { getStoredUserInfo } from "../../utils/userInfo";
import BackButton from "../../components/BackButton";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    images: [],
    description: "",
    stock: "",
    preorderDate: "",
    sizes: [],
    unavailableSizes: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedOrderView, setSelectedOrderView] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/products`);
      setProducts(data);
    } catch (err) {
      setError("Failed to load products.");
      console.error("Failed to load products:", err);
    }
  };

  const fetchOrders = async () => {
    const userInfo = getStoredUserInfo();

    if (!userInfo?.token) {
      setError("Admin access required to load orders.");
      setOrders([]);
      return;
    }

    if (!userInfo.isAdmin && !userInfo.isOrderManager) {
      setError("You need admin or order manager access to view orders.");
      setOrders([]);
      return;
    }

    try {
      const { data } = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders.");
      console.error("Failed to fetch orders:", err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const info = getStoredUserInfo();

      if (!info?.token || (!info.isAdmin && !info.isOrderManager)) {
        router.push("/login");
        return;
      }

      setUserInfo(info);
      fetchProducts();
      fetchOrders();
    }, 0);
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const userInfo = getStoredUserInfo();
    if (!userInfo?.token) {
      setError("Admin login required for upload.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      const uploadedImages = Array.isArray(data.urls) ? data.urls : data.url ? [data.url] : [];
      setForm((prev) => ({
        ...prev,
        image: prev.image || uploadedImages[0] || "",
        images: [...(prev.images || []), ...uploadedImages],
      }));
      setSuccess(`${uploadedImages.length} image${uploadedImages.length === 1 ? "" : "s"} uploaded successfully!`);
      setUploading(false);
    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.response?.data?.message || "Upload failed.");
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      image: "",
      images: [],
      description: "",
      stock: "",
      preorderDate: "",
      sizes: [],
      unavailableSizes: [],
    });
    setEditingId(null);
  };

  const toggleSize = (size) => {
    setForm((prev) => {
      const currentSizes = Array.isArray(prev.sizes) ? prev.sizes : [];
      const newSizes = currentSizes.includes(size)
        ? currentSizes.filter((s) => s !== size)
        : [...currentSizes, size];
      return {
        ...prev,
        sizes: newSizes,
        unavailableSizes: newSizes.includes(size)
          ? prev.unavailableSizes
          : (prev.unavailableSizes || []).filter((item) => item !== size),
      };
    });
  };

  const handleSelectAllSizes = () => {
    setForm((prev) => ({ ...prev, sizes: [...ALL_SIZES] }));
  };

  const handleClearSizes = () => {
    setForm((prev) => ({ ...prev, sizes: [], unavailableSizes: [] }));
  };

  const toggleUnavailableSize = (size) => {
    setForm((prev) => {
      const unavailableSizes = Array.isArray(prev.unavailableSizes) ? prev.unavailableSizes : [];
      return {
        ...prev,
        unavailableSizes: unavailableSizes.includes(size)
          ? unavailableSizes.filter((item) => item !== size)
          : [...unavailableSizes, size],
      };
    });
  };

  const movePhoto = (index, direction) => {
    setForm((prev) => {
      const images = [...(prev.images || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= images.length) return prev;

      [images[index], images[targetIndex]] = [images[targetIndex], images[index]];
      return { ...prev, images, image: images[0] || "" };
    });
  };

  const removePhoto = (index) => {
    setForm((prev) => {
      const images = (prev.images || []).filter((_, imageIndex) => imageIndex !== index);
      return { ...prev, images, image: images[0] || "" };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userInfo = getStoredUserInfo();

    if (!userInfo?.token) {
      setError("Admin login required.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      const productData = {
        ...form,
        image: form.images?.[0] || form.image || "",
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/api/products/${editingId}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        setSuccess("Product updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/products`, productData, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        setSuccess("Product added successfully.");
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Request failed.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      price: product.price || "",
      image: product.image || "",
      images: Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image ? [product.image] : [],
      description: product.description || "",
      stock: product.stock === null || product.stock === undefined ? "" : product.stock,
      preorderDate: product.preorderDate ? product.preorderDate.slice(0, 10) : "",
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      unavailableSizes: Array.isArray(product.unavailableSizes) ? product.unavailableSizes : [],
    });
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    const userInfo = getStoredUserInfo();

    if (!userInfo?.token) {
      setError("Admin login required.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Product deleted successfully.");
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const userInfo = getStoredUserInfo();
    if (!userInfo?.token) {
      setError("Admin login required.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setSuccess("Order status updated successfully.");
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status.");
    }
  };

  const handleSelectAllOrders = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(o => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleBulkDeleteOrders = async () => {
    if (!selectedOrders.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} selected order(s)?`)) return;

    const userInfo = getStoredUserInfo();
    if (!userInfo?.token) {
      setError("Admin login required.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await axios.post(`${API_URL}/api/orders/bulk-delete`, {
        orderIds: selectedOrders
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setSuccess("Selected orders deleted successfully.");
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete orders.");
    }
  };

  const handleSingleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    const userInfo = getStoredUserInfo();
    if (!userInfo?.token) {
      setError("Admin login required.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await axios.delete(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setSuccess("Order deleted successfully.");
      setSelectedOrders(selectedOrders.filter(oId => oId !== id));
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete order.");
    }
  };

  const handleRestoreStock = async (order) => {
    if (
      !window.confirm(
        `Restore stock for order #${order.orderNumber}? This will add back the stock this order deducted (e.g. because the payment proof turned out to be fake).`
      )
    )
      return;

    const userInfo = getStoredUserInfo();
    if (!userInfo?.token) {
      setError("Admin login required.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const { data } = await axios.post(
        `${API_URL}/api/orders/${order._id}/restore-stock`,
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setSelectedOrderView(data);
      setSuccess(`Stock restored for order #${order.orderNumber}.`);
      fetchOrders();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restore stock.");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone?.includes(searchQuery)
  );

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <BackButton fallbackUrl="/" />
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gold-gradient tracking-tight">
          {userInfo?.isAdmin ? "Admin Dashboard" : "Order Management Dashboard"}
        </h1>
        
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search products or orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white/5 text-white border border-white/20 shadow-lg outline-none focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] transition-all placeholder-white/50"
          />
          <svg className="w-5 h-5 absolute left-4 top-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-100 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl bg-green-100 text-green-700 px-4 py-3">
          {success}
        </div>
      )}

      {userInfo?.isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 glass p-8 rounded-3xl mb-10"
        >
          <h2 className="text-2xl font-bold text-gold-gradient mb-2">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>

          <input
            className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
            type="text"
            name="name"
            placeholder="Product name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
              type="number"
              min="0"
              name="stock"
              placeholder="Stock (leave blank for unlimited)"
              value={form.stock}
              onChange={handleChange}
            />
            <div>
              <label className="block text-xs text-white/40 mb-1 pl-1">
                Preorder date (shown once stock hits 0)
              </label>
              <input
                className="w-full border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
                type="date"
                name="preorderDate"
                value={form.preorderDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <input
              className="flex-grow border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
              type="text"
              name="image"
              placeholder="Image URL"
              value={form.image}
              onChange={handleChange}
            />
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`h-full flex items-center justify-center px-6 rounded-2xl cursor-pointer border border-[rgba(212,175,55,0.5)] text-gold-gradient font-semibold hover:bg-[rgba(212,175,55,0.1)] transition-all ${uploading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Photos
                  </>
                )}
              </label>
            </div>
          </div>

          {form.images?.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {form.images.map((imageUrl, index) => (
                <div key={`${imageUrl}-${index}`} className="relative w-24">
                  <Image
                    src={imageUrl}
                    alt={`Product photo ${index + 1}`}
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-xl border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    aria-label={`Delete photo ${index + 1}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-lg hover:bg-red-500"
                  >
                    &times;
                  </button>
                  <div className="mt-1 flex justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => movePhoto(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move photo ${index + 1} left`}
                      className="flex-1 rounded bg-white/10 px-1 py-1 text-xs text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-20"
                    >
                      &#8592;
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(index, 1)}
                      disabled={index === form.images.length - 1}
                      aria-label={`Move photo ${index + 1} right`}
                      className="flex-1 rounded bg-white/10 px-1 py-1 text-xs text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-20"
                    >
                      &#8594;
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 right-1 rounded bg-black/70 px-1 py-0.5 text-center text-[10px] text-white">
                      Main photo
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <textarea
            className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all resize-none"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />

          {/* Available Sizes Selector */}
          <div className="border border-white/10 bg-white/5 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-white/80">
                Available Sizes (XS to 4XL)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllSizes}
                  className="text-xs text-[#D4AF37] hover:underline px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearSizes}
                  className="text-xs text-white/50 hover:underline px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {ALL_SIZES.map((size) => {
                const isSelected = form.sizes?.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-[#BF953F] to-[#FBF5B7] text-black shadow-md scale-105"
                        : "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 hover:border-white/30"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {size}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-white/40 mt-3">
              Checked sizes will be selectable. Use the buttons below to mark selected sizes out of stock.
            </p>
            {form.sizes?.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="mb-2 text-xs font-semibold text-white/70">Size stock status</p>
                <div className="flex flex-wrap gap-2">
                  {form.sizes.map((size) => {
                    const isUnavailable = form.unavailableSizes?.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleUnavailableSize(size)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                          isUnavailable
                            ? "border-red-500/60 bg-red-500/20 text-red-300"
                            : "border-green-500/40 bg-green-500/10 text-green-300"
                        }`}
                      >
                        {size}: {isUnavailable ? "Out of stock" : "In stock"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              disabled={uploading}
              className={`btn-main px-8 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? "Uploading..." : (editingId ? "Update Product" : "Add Product")}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary px-8"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {userInfo?.isAdmin && (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-3 text-center py-10 text-white/50 glass rounded-3xl w-full">
              No products found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredProducts.map((product) => (
            <div
              key={product._id}
              className="glass rounded-3xl p-5 text-white flex flex-col hover:-translate-y-1 transition-transform duration-300"
            >
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={640}
                  height={384}
                  className="w-full h-48 object-cover rounded-2xl mb-4 opacity-90"
                />
              )}

              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-white/60 mt-2 text-sm flex-grow">
                {product.description || "No description"}
              </p>
              <p className="font-bold mt-4 text-gold-gradient text-lg">{product.price} MAD</p>

              {/* Sizes badges */}
              <div className="mt-2 flex flex-wrap gap-1 items-center">
                <span className="text-[11px] text-white/40 mr-1">Sizes:</span>
                {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
                  product.sizes.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#FBF5B7] border border-[#D4AF37]/30"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-white/40 italic">None selected</span>
                )}
              </div>

              {(product.stock !== null && product.stock !== undefined) && (
                <span
                  className={`mt-2 inline-block w-fit px-3 py-1 rounded-lg text-xs font-bold ${
                    product.stock > 0
                      ? "bg-white/10 text-white/70"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : `Out of Stock${product.preorderDate ? ` — Preorder, available ${new Date(product.preorderDate).toLocaleDateString()}` : " — Preorder"}`}
                </span>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 btn-secondary text-sm py-2 px-0 min-w-0"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-full text-sm py-2 transition-colors border border-transparent"
                >
                  Delete
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      )}

      <div className="mt-16 mb-6 border-t border-[rgba(212,175,55,0.2)] pt-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gold-gradient">Order Management</h2>
        {userInfo?.isAdmin && (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
                  setSelectedOrders([]);
                } else {
                  setSelectedOrders(filteredOrders.map(o => o._id));
                }
              }}
              className="bg-white/10 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors border border-white/10"
            >
              Tout Sélectionner
            </button>
            
            <button
              onClick={handleBulkDeleteOrders}
              disabled={selectedOrders.length === 0}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border
              ${selectedOrders.length > 0 
                  ? "bg-red-600/80 border-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]" 
                  : "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"}`}
            >
              Delete Selected ({selectedOrders.length})
            </button>
          </div>
        )}
      </div>

      <div className="glass rounded-3xl overflow-x-auto text-white mb-12">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-5 w-12 text-center">
                {userInfo?.isAdmin && (
                  <input
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer accent-[#D4AF37]"
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={handleSelectAllOrders}
                  />
                )}
              </th>
              <th className="p-5 font-semibold text-white/70">Order #</th>
              <th className="p-5 font-semibold text-white/70">Customer</th>
              <th className="p-5 font-semibold text-white/70">Total</th>
              <th className="p-5 font-semibold text-white/70">Date</th>
              <th className="p-5 font-semibold text-white/70">Status</th>
              <th className="p-5 font-semibold text-white/70 text-center">Payment Proof</th>
              <th className="p-5 font-semibold text-white/70 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-10 text-center text-white/50">No orders found matching your search.</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className={`border-b border-white/5 transition-colors ${selectedOrders.includes(order._id) ? "bg-[rgba(212,175,55,0.1)]" : "hover:bg-white/5"}`}>
                  <td className="p-5 text-center">
                    {userInfo?.isAdmin && (
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer accent-[#D4AF37]"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => handleSelectOrder(order._id)}
                      />
                    )}
                  </td>
                  <td className="p-5 font-mono text-sm text-[rgba(251,245,183,0.8)]">
                    {order.orderNumber}
                    {order.hasPreorderItems && (
                      <span className="ml-2 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 text-white align-middle">
                        PREORDER
                      </span>
                    )}
                    {order.stockRestored && (
                      <span className="ml-2 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white/50 align-middle">
                        RESTORED
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-white/50">{order.customerPhone}</div>
                  </td>
                  <td className="p-5 font-bold text-gold-gradient">{order.total} MAD</td>
                  <td className="p-5 text-sm text-white/60">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status || "pending"}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`border-2 px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer w-full transition-colors
                        ${!order.status || order.status === "pending" ? "bg-blue-600 text-white border-blue-500" : ""}
                        ${order.status === "processing" ? "bg-yellow-100 text-yellow-900 border-yellow-300" : ""}
                        ${order.status === "shipped" ? "bg-yellow-400 text-yellow-950 border-yellow-500" : ""}
                        ${order.status === "delivered" ? "bg-green-500 text-white border-green-600" : ""}
                        ${order.status === "canceled" ? "bg-red-600 text-white border-red-700" : ""}
                      `}
                    >
                      <option value="pending" className="bg-white text-black font-semibold">🔵 Pending</option>
                      <option value="processing" className="bg-white text-black font-semibold">🟡 Processing</option>
                      <option value="shipped" className="bg-white text-black font-semibold">🟠 Shipped</option>
                      <option value="delivered" className="bg-white text-black font-semibold">🟢 Delivered</option>
                      <option value="canceled" className="bg-white text-black font-semibold">🔴 Canceled</option>
                    </select>
                  </td>
                  <td className="p-5 text-center">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          order.paymentProofUrl
                            ? "bg-green-500 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {order.paymentProofUrl ? "Submitted" : "No Proof"}
                      </span>
                      <button
                        onClick={() => order.paymentProofUrl && window.open(order.paymentProofUrl, "_blank", "noopener,noreferrer")}
                        disabled={!order.paymentProofUrl}
                        title={order.paymentProofUrl ? "View Payment Proof" : "No proof submitted yet"}
                        className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
                          order.paymentProofUrl
                            ? "text-white/40 hover:text-gold hover:bg-gold/10 cursor-pointer"
                            : "text-white/15 cursor-not-allowed"
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                   <td className="p-5 text-center flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedOrderView(order)}
                      className="text-white/40 hover:text-gold font-medium text-sm inline-flex items-center justify-center p-2 rounded-full hover:bg-gold/10 transition-colors"
                      title="Preview Order"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    {userInfo?.isAdmin && (
                      <button
                        onClick={() => handleSingleDeleteOrder(order._id)}
                        className="text-white/40 hover:text-red-500 font-medium text-sm inline-flex items-center justify-center p-2 rounded-full hover:bg-red-500/10 transition-colors"
                        title="Delete Order"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrderView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedOrderView(null)}
          ></div>
          
          <div className="relative glass rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <h3 className="text-2xl font-bold text-gold-gradient">Order Details</h3>
                <p className="text-white/50 text-sm mt-1">Order Number: {selectedOrderView.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderView(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Customer Info</h4>
                  <p className="font-semibold text-lg">{selectedOrderView.customerName}</p>
                  <p className="text-white/60">{selectedOrderView.customerPhone}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Order Status & Date</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full 
                      ${selectedOrderView.status === "delivered" ? "bg-green-500" : 
                        selectedOrderView.status === "canceled" ? "bg-red-500" : 
                        selectedOrderView.status === "shipped" ? "bg-orange-500" : "bg-blue-500"}
                    `}></span>
                    <p className="font-semibold capitalize">{selectedOrderView.status || "pending"}</p>
                  </div>
                  <p className="text-white/60 text-sm">{new Date(selectedOrderView.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Shipping Address</h4>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-white/80 leading-relaxed italic">
                    &quot;{selectedOrderView.customerAddress || "No address provided"}&quot;
                  </p>
                </div>
              </div>

              {/* Payment Proof */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Payment Proof</h4>
                {selectedOrderView.paymentProofUrl ? (
                  <a
                    href={selectedOrderView.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors"
                  >
                    {/\.pdf($|\?)/i.test(selectedOrderView.paymentProofUrl) ? (
                      <span className="text-gold-gradient font-semibold">View PDF Receipt</span>
                    ) : (
                      <Image
                        src={selectedOrderView.paymentProofUrl}
                        alt="Payment proof"
                        width={800}
                        height={600}
                        className="max-h-64 rounded-xl object-contain mx-auto"
                      />
                    )}
                  </a>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-white/50 italic">No proof submitted yet</p>
                  </div>
                )}

                {selectedOrderView.items?.some((item) => item.stockDeducted > 0) && (
                  selectedOrderView.stockRestored ? (
                    <span className="mt-3 inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white/50">
                      Stock already restored for this order
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRestoreStock(selectedOrderView)}
                      className="mt-3 bg-green-600/80 hover:bg-green-600 text-white font-semibold rounded-full text-sm py-2 px-5 transition-colors border border-transparent"
                    >
                      Restore Stock (fake/canceled order)
                    </button>
                  )
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrderView.items && selectedOrderView.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                      {item.image && (
                        <Image src={item.image} alt={item.name} width={64} height={64} className="w-16 h-16 rounded-xl object-cover shadow-lg" />
                      )}
                      <div className="flex-grow">
                        <p className="font-semibold">
                          {item.name}
                          {item.size && (
                            <span className="ml-2 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D4AF37]/20 text-[#FBF5B7] border border-[#D4AF37]/30 align-middle">
                              Size: {item.size}
                            </span>
                          )}
                          {item.isPreorder && (
                            <span className="ml-2 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 text-white align-middle">
                              PREORDER{item.preorderDate ? ` — ${new Date(item.preorderDate).toLocaleDateString()}` : ""}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-white/50">{item.price} MAD x {item.qty || 1}</p>
                      </div>
                      <div className="text-right font-bold text-gold-gradient">
                        {(item.price * (item.qty || 1))} MAD
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/5 border-t border-white/10 flex items-center justify-between">
              <span className="text-white/50">Total Amount</span>
              <span className="text-3xl font-bold text-gold-gradient">{selectedOrderView.total} MAD</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}