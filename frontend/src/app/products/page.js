"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import API_URL from "../../utils/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  
  const cart = useCart() || {};
  const { addToCart } = cart;
  const cartItems = Array.isArray(cart.cartItems) ? cart.cartItems : [];
  const totalQty = cartItems.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await axios.get(`${API_URL}/api/products`);
      setProducts(data);
    };

    fetchProducts();
  }, []);

  const handleGoToCart = () => {
    setIsClicked(true);
    setTimeout(() => {
      router.push("/cart");
    }, 250);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="glass rounded-3xl p-4 text-white hover:-translate-y-1 transition-transform duration-300">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-2xl mb-4 opacity-90"
              />
            )}
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-white/60 mt-1 text-sm">{product.description}</p>
            <p className="font-bold mt-3 text-gold-gradient">{product.price} MAD</p>
            <button
              onClick={() => addToCart(product)}
              className="mt-4 w-full btn-main text-sm"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

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