"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import API_URL from "../../utils/api";
import { useLanguage } from "../../context/LanguageContext";
import BackButton from "../../components/BackButton";

export default function ProductsClient({ initialProducts = [] }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState(initialProducts);
  const [isClicked, setIsClicked] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [sizeErrorProductId, setSizeErrorProductId] = useState(null);
  const router = useRouter();

  // Sync with backend on mount to catch any recent edits
  useEffect(() => {
    const refreshProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/products`);
        setProducts(data);
      } catch (err) {
        console.error("Failed to refresh products:", err);
      }
    };
    refreshProducts();
  }, []);
  
  const cart = useCart() || {};
  const { addToCart } = cart;
  const cartItems = Array.isArray(cart.cartItems) ? cart.cartItems : [];
  const totalQty = cartItems.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);

  const handleGoToCart = () => {
    setIsClicked(true);
    setTimeout(() => {
      router.push("/cart");
    }, 250);
  };

  const openGallery = (product) => {
    const images = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image ? [product.image] : [];
    if (images.length) setSelectedGallery({ images, index: 0 });
  };

  const moveGallery = (direction) => {
    setSelectedGallery((gallery) => {
      if (!gallery || gallery.images.length < 2) return gallery;
      return {
        ...gallery,
        index: (gallery.index + direction + gallery.images.length) % gallery.images.length,
      };
    });
  };

  const handleOrderNow = (product) => {
    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
    const selectedSize = selectedSizes[product._id] || "";

    if (hasSizes && !selectedSize) {
      setSizeErrorProductId(product._id);
      return;
    }

    if (product.unavailableSizes?.includes(selectedSize)) {
      setSizeErrorProductId(product._id);
      return;
    }

    setSizeErrorProductId(null);
    addToCart(product, selectedSize);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <BackButton fallbackUrl="/" />

      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold mb-6 text-gold-gradient"
      >
        {t("products")}
      </motion.h1>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-3 gap-6"
      >
        {products.map((product) => (
          <motion.div 
            key={product._id} 
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="glass rounded-3xl p-4 text-white shadow-xl flex flex-col h-full group"
          >
            {(product.images?.length > 0 || product.image) && (
              <div 
                className="relative overflow-hidden rounded-2xl mb-4 h-64 bg-black/20 cursor-zoom-in"
                onClick={() => openGallery(product)}
              >
                <Image
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/20 transition-opacity">
                    {t("clickToExpand")}
                  </span>
                </div>
              </div>
            )}
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-white/60 mt-1 text-sm flex-grow line-clamp-2">{product.description}</p>
            <p className="font-bold mt-4 text-gold-gradient text-lg">
              {product.price} {t("mad")}
            </p>

            {product.stock !== null && product.stock !== undefined && (
              <div className="mt-1">
                {product.stock > 0 ? (
                  <>
                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      {t("limitedStock")}
                    </p>
                    <p className="text-xs font-bold text-gold-gradient mt-1">
                      {product.stock} {t("itemsLeft")}
                    </p>
                  </>
                ) : (
                  <p className="text-xs font-bold text-red-500">{t("outOfStock")}</p>
                )}
              </div>
            )}

            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-white/50 mr-1">{t("selectSize")}:</span>
                {product.sizes.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setSelectedSizes((prev) => ({ ...prev, [product._id]: s }));
                      setSizeErrorProductId(null);
                    }}
                    disabled={product.unavailableSizes?.includes(s)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors border ${
                      product.unavailableSizes?.includes(s)
                        ? "border-red-500/60 bg-red-500/15 text-red-400 line-through cursor-not-allowed"
                        : selectedSizes[product._id] === s
                          ? "bg-[#D4AF37] text-black border-[#FBF5B7]"
                          : "bg-[#D4AF37]/15 text-[#FBF5B7] border-[#D4AF37]/25 hover:bg-[#D4AF37]/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                </div>
                {sizeErrorProductId === product._id && (
                  <p className="mt-2 text-xs font-medium text-red-400">{t("sizeRequired")}</p>
                )}
              </div>
            )}

            <button
              onClick={() => handleOrderNow(product)}
              className="mt-4 w-full btn-main text-sm py-3"
            >
              {t("orderNow")}
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {selectedGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGallery(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-[80vh]"
            >
              <Image
                src={selectedGallery.images[selectedGallery.index]}
                alt="Full preview"
                fill
                sizes="100vw"
                className="object-contain"
              />
              {selectedGallery.images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl text-white hover:bg-black/80"
                    onClick={(event) => { event.stopPropagation(); moveGallery(-1); }}
                  >
                    &#8592;
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl text-white hover:bg-black/80"
                    onClick={(event) => { event.stopPropagation(); moveGallery(1); }}
                  >
                    &#8594;
                  </button>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                    {selectedGallery.index + 1} / {selectedGallery.images.length}
                  </span>
                </>
              )}
              <button
                type="button"
                className="absolute top-[-40px] right-0 text-white text-4xl hover:text-gold transition-colors"
                onClick={() => setSelectedGallery(null)}
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {totalQty > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleGoToCart}
            className={`
              btn-main flex items-center gap-3 px-8 py-5 shadow-[0_10px_30px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95
              ${isClicked ? "opacity-80 scale-95" : ""}
            `}
          >
            <span className="text-black uppercase tracking-wider">{t("cart")}</span>
            <span className="bg-black/10 text-black px-3 py-1 rounded-full text-sm font-bold border border-black/10">
              {totalQty} {totalQty === 1 ? t("itemCount") : t("itemsCount")}
            </span>
            <svg className="w-5 h-5 ml-1 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
