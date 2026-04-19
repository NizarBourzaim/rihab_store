"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

import { motion } from "framer-motion";

export default function ProductsClient({ initialProducts = [] }) {
  const [products] = useState(initialProducts);
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  
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
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold mb-6 text-gold-gradient"
      >
        Products
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
            className="glass rounded-3xl p-4 text-white shadow-xl flex flex-col h-full"
          >
            {product.image && (
              <div className="relative overflow-hidden rounded-2xl mb-4 h-48">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-110"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-white/60 mt-1 text-sm flex-grow">{product.description}</p>
            <p className="font-bold mt-4 text-gold-gradient text-lg">{product.price} MAD</p>
            <button
              onClick={() => addToCart(product)}
              className="mt-4 w-full btn-main text-sm py-3"
            >
              Add to Cart
            </button>
          </motion.div>
        ))}
      </motion.div>

      {totalQty > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleGoToCart}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95
              ${isClicked ? "bg-green-600 scale-95" : "bg-gray-600/90 backdrop-blur border border-white/10 hover:bg-gray-500/90"}
            `}
          >
            <span>Cart</span>
            <span className="bg-white text-black px-3 py-1 rounded-full text-sm">
              {totalQty} {totalQty === 1 ? "item" : "items"}
            </span>
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
