"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
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
    const availableSizes = (initialProduct?.sizes || []).filter(
      (size) => !initialProduct?.unavailableSizes?.includes(size)
    );
    return availableSizes.length > 0
      ? availableSizes[0]
      : "";
  });
  const [sizeError, setSizeError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!params?.id) return;

    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/products/${params.id}`
        );
        setProduct(data);
        setSelectedImageIndex(0);
        if (Array.isArray(data?.sizes) && data.sizes.length > 0) {
          const availableSizes = data.sizes.filter(
            (size) => !data.unavailableSizes?.includes(size)
          );
          setSelectedSize((prev) => (prev && availableSizes.includes(prev) ? prev : availableSizes[0] || ""));
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
    if (product.unavailableSizes?.includes(sizeToUse)) {
      setSizeError(t("outOfStock"));
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

  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image ? [product.image] : [];

  return (
    <section className="py-20">
      <div className="container-custom">
        <BackButton fallbackUrl="/products" />
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="glass rounded-[28px] p-4 relative min-h-[400px] h-[600px] flex items-center justify-center">
            <Image
              src={productImages[selectedImageIndex] || product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain rounded-2xl"
            />
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => setSelectedImageIndex((index) => (index - 1 + productImages.length) % productImages.length)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl text-white hover:bg-black/80"
                >
                  &#8592;
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => setSelectedImageIndex((index) => (index + 1) % productImages.length)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl text-white hover:bg-black/80"
                >
                  &#8594;
                </button>
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  {selectedImageIndex + 1} / {productImages.length}
                </span>
              </>
            )}
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
                    const isUnavailable = product.unavailableSizes?.includes(size);
                    const isSelected = isAvailable && selectedSize === size;

                    if (isAvailable && !isUnavailable) {
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
