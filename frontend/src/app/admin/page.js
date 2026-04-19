"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../utils/api";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  const getUserInfo = () => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("userInfo");
    return stored ? JSON.parse(stored) : null;
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/products`);
      setProducts(data);
    } catch (err) {
      setError("Failed to load products.");
    }
  };

  const fetchOrders = async () => {
    const userInfo = getUserInfo();
    if (!userInfo?.token) return;

    try {
      const { data } = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userInfo = getUserInfo();
    if (!userInfo?.token) {
      setError("Admin login required for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      console.log("Upload Success:", data.url);
      setForm((prev) => ({ ...prev, image: data.url }));
      setSuccess("Image uploaded successfully!");
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
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userInfo = getUserInfo();

    if (!userInfo?.token) {
      setError("Admin login required.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      if (editingId) {
        await axios.put(
          `${API_URL}/api/products/${editingId}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        setSuccess("Product updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/products`, form, {
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
      description: product.description || "",
    });
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    const userInfo = getUserInfo();

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
    const userInfo = getUserInfo();
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

    const userInfo = getUserInfo();
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
    const userInfo = getUserInfo();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gold-gradient tracking-tight">Admin Dashboard</h1>
        
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
                  Upload
                </>
              )}
            </label>
          </div>
        </div>

        <textarea
          className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all resize-none"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={4}
        />

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

      <div className="grid md:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-3 text-center py-10 text-white/50 glass rounded-3xl w-full">
            No products found matching "{searchQuery}"
          </div>
        ) : (
          filteredProducts.map((product) => (
          <div
            key={product._id}
            className="glass rounded-3xl p-5 text-white flex flex-col hover:-translate-y-1 transition-transform duration-300"
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-2xl mb-4 opacity-90"
              />
            )}

            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-white/60 mt-2 text-sm flex-grow">
              {product.description || "No description"}
            </p>
            <p className="font-bold mt-4 text-gold-gradient text-lg">{product.price} MAD</p>

            <div className="mt-5 flex gap-3">
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

      <div className="mt-16 mb-6 border-t border-[rgba(212,175,55,0.2)] pt-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gold-gradient">Order Management</h2>
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
      </div>

      <div className="glass rounded-3xl overflow-x-auto text-white mb-12">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-5 w-12 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer accent-[#D4AF37]"
                  checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                  onChange={handleSelectAllOrders}
                />
              </th>
              <th className="p-5 font-semibold text-white/70">Order #</th>
              <th className="p-5 font-semibold text-white/70">Customer</th>
              <th className="p-5 font-semibold text-white/70">Total</th>
              <th className="p-5 font-semibold text-white/70">Date</th>
              <th className="p-5 font-semibold text-white/70">Status</th>
              <th className="p-5 font-semibold text-white/70 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-10 text-center text-white/50">No orders found matching your search.</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className={`border-b border-white/5 transition-colors ${selectedOrders.includes(order._id) ? "bg-[rgba(212,175,55,0.1)]" : "hover:bg-white/5"}`}>
                  <td className="p-5 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-[#D4AF37]"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleSelectOrder(order._id)}
                    />
                  </td>
                  <td className="p-5 font-mono text-sm text-[rgba(251,245,183,0.8)]">{order.orderNumber}</td>
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
                    <button
                      onClick={() => handleSingleDeleteOrder(order._id)}
                      className="text-white/40 hover:text-red-500 font-medium text-sm inline-flex items-center justify-center p-2 rounded-full hover:bg-red-500/10 transition-colors"
                      title="Delete Order"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}