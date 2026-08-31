"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../../../context/CartContext";
import { useParams } from "next/navigation";
import API_URL from "../../../utils/api";
import { useLanguage } from "../../../context/LanguageContext";
import BackButton from "../../../components/BackButton";

const ALL_SIZES = ["S", "M", "L"];

export default function ProductDetailsClient({ initialProduct }) {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const params = useParams();
  const [product, setProduct] = useState(initialProduct);
  const [selectedSize, setSelectedSize] = useState(() => {
    return Array.isArray(initialProduct?.sizes) && initialProduct.sizes.length > 0
      ? initialProduct.sizes[0]
      : "";
  });
  const [sizeError, setSizeError] = useState("");

  useEffect(() => {
    if (!params?.id) return;

    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/products/${params.id}`
        );
        setProduct(data);
        if (Array.isArray(data?.sizes) && data.sizes.length > 0) {
          setSelectedSize((prev) => (prev && data.sizes.includes(prev) ? prev : data.sizes[0]));
        }
      } catch (error) {
        console.error("Refresh failed:", error);
      }
    };

    // Even if we have initialProduct, we refresh to get the absolute latest (e.g. from an edit)
    fetchProduct();
  }, [params?.id]);

  const handleAddToCart = () => {
    const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;
    const sizeToUse = selectedSize || (hasSizes ? product.sizes[0] : "");

    if (hasSizes && !sizeToUse) {
      setSizeError(t("sizeRequired"));
      return;
    }
    setSizeError("");
    addToCart(product, sizeToUse);
  };

  if (!product) {
    return (
      <section className="py-20">
        <div className="container-custom">
          <BackButton fallbackUrl="/products" />
          <div className="glass rounded-3xl p-8 text-white/70">
            {t("loading")}...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container-custom">
        <BackButton fallbackUrl="/products" />
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="glass rounded-[28px] p-4 flex items-center justify-center min-h-[400px]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-h-[600px] object-contain rounded-2xl"
            />
          </div>

          <div className="glass rounded-[28px] p-8">
            <h1 className="text-4xl font-semibold">{product.name}</h1>

            <p className="text-white/60 mt-5 leading-8">
              {product.description}
            </p>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-3xl font-bold">
                {product.price} {t("mad")}
              </span>
            </div>

            {/* Available Sizes Section — only renders if admin has configured sizes */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white/80">
                    {t("selectSize")}
                  </span>
                  {selectedSize && (
                    <span className="text-xs text-[#D4AF37] font-bold">
                      {t("size")}: {selectedSize}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {ALL_SIZES.map((size) => {
                    const isAvailable = product.sizes.includes(size);
                    const isSelected = isAvailable && selectedSize === size;

                    if (isAvailable) {
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError("");
                          }}
                          className={`relative px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-r from-[#BF953F] to-[#FBF5B7] text-black shadow-lg scale-105 border border-[#FBF5B7]"
                              : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#D4AF37]/60"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    }

                    // Barred / Unavailable state
                    return (
                      <div
                        key={size}
                        title={`${size} — ${t("outOfStock")}`}
                        className="relative px-4 py-2.5 rounded-xl font-semibold text-sm bg-white/[0.03] text-white/20 border border-white/5 cursor-not-allowed select-none overflow-hidden"
                      >
                        <span className="line-through decoration-red-500/70 decoration-2">{size}</span>
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="w-full h-[1.5px] bg-red-500/40 rotate-[-25deg] translate-y-[14px]" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {sizeError && (
                  <p className="text-red-400 text-xs mt-2 font-medium">{sizeError}</p>
                )}
              </div>
            )}

            {product.stock !== null && product.stock !== undefined && (
              <div className="mt-4">
                {product.stock > 0 ? (
                  <>
                    <p className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {t("limitedStock")}
                    </p>
                    <p className="text-sm font-bold text-gold-gradient mt-3">
                      {product.stock} {t("itemsLeft")}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-red-500">
                    {t("outOfStock")}
                    {product.preorderDate ? ` — ${t("expectedAvailability")} ${new Date(product.preorderDate).toLocaleDateString()}` : ""}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="btn-main mt-8 w-full"
            >
              {product.stock !== null && product.stock !== undefined && product.stock <= 0
                ? t("preorderNow")
                : t("addToCart")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
