"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import API_URL from "../../utils/api";

import { useLanguage } from "../../context/LanguageContext";

export default function CartPage() {
  const { t } = useLanguage();
  const { cartItems = [], removeFromCart, updateQty, clearCart } = useCart();

  const [customer, setCustomer] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
  });

  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Removed automatic pre-filling of customer info to keep it clean for every order
  useEffect(() => {
    // Info is now empty by default as requested
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

  const handleOrder = async () => {
    if (!customer.customerName || !customer.customerPhone || !customer.customerAddress) {
      alert(t("fillAllFields"));
      return;
    }

    if (cartItems.length === 0) {
      alert(t("emptyCart"));
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerName: customer.customerName,
        customerPhone: customer.customerPhone,
        customerAddress: customer.customerAddress,
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          price: Number(item.price || 0),
          qty: Number(item.qty || 1),
          image: item.image || "",
        })),
        total,
      };

      const { data } = await axios.post(
        `${API_URL}/api/orders/whatsapp`,
        payload
      );

      setOrderInfo(data);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gold-gradient">{t("cart")}</h1>

      {isSuccess ? (
        <div className="glass rounded-[32px] p-10 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{t("orderSuccess")}</h2>
          <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
            {t("orderNumber")} <span className="text-[#D4AF37] font-mono font-bold">#{orderInfo?.orderNumber}</span>. {t("contactSoon")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-main px-8">
              {t("continueShopping")}
            </Link>
            {orderInfo?.downloadUrl && (
              <a 
                href={`${API_URL}${orderInfo.downloadUrl}`}
                className="btn-secondary px-8 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t("downloadReceipt")}
              </a>
            )}
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-white">
          <p className="text-lg text-white/70">{t("emptyCart")}</p>
          <Link
            href="/products"
            className="inline-block mt-6 btn-main"
          >
            {t("goToProducts")}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-5">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="glass rounded-3xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-center gap-5">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-2xl opacity-90"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center text-sm text-white/50">
                      No image
                    </div>
                  )}

                  <div>
                    <h2 className="font-semibold text-xl">{item.name}</h2>
                    <p className="text-white/60 mt-1 line-clamp-1">{item.description}</p>
                    <p className="font-bold mt-2 text-gold-gradient">{item.price} {t("mad")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item._id, e.target.value)}
                    className="border border-white/20 bg-white/5 rounded-2xl p-3 w-20 text-white text-center focus:border-[rgba(212,175,55,0.5)] outline-none"
                  />

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="bg-red-600/80 hover:bg-red-600 text-white px-5 py-3 rounded-2xl transition-colors"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 glass rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold text-gold-gradient">{t("customerInfo")}</h2>

            <div className="grid gap-5 mt-6">
              <input
                type="text"
                placeholder={t("yourName")}
                value={customer.customerName}
                onChange={(e) =>
                  setCustomer({ ...customer, customerName: e.target.value })
                }
                className="border border-white/20 bg-white/5 rounded-2xl p-4 text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
              />

              <input
                type="text"
                placeholder={t("yourPhone")}
                value={customer.customerPhone}
                onChange={(e) =>
                  setCustomer({ ...customer, customerPhone: e.target.value })
                }
                className="border border-white/20 bg-white/5 rounded-2xl p-4 text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
              />

              <textarea
                placeholder={t("yourAddress")}
                value={customer.customerAddress}
                onChange={(e) =>
                  setCustomer({ ...customer, customerAddress: e.target.value })
                }
                className="border border-white/20 bg-white/5 rounded-2xl p-4 text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-8 glass rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold text-gold-gradient">{t("orderSummary")}</h2>
            <p className="mt-4 text-xl font-semibold bg-white/5 inline-block px-4 py-2 rounded-xl border border-white/10">{t("total")}: <span className="text-gold-gradient">{total} {t("mad")}</span></p>

            <div className="mt-6">
              <button
                onClick={handleOrder}
                disabled={loading}
                className="btn-main px-10 py-4 disabled:opacity-60"
              >
                {loading ? t("creatingOrder") : t("orderNow")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}