"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="glass rounded-[28px] overflow-hidden p-4 group transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/products/${product._id}`} className="block">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-72 object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/products/${product._id}`}>
              <h3 className="text-xl font-semibold">{product.name}</h3>
            </Link>
            <p className="text-white/60 mt-2 leading-7">{product.description}</p>
          </div>

          <span className="text-lg font-bold whitespace-nowrap">
            {product.price} MAD
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-sm text-white/45">Premium selection</span>

          <button
            onClick={() => addToCart(product)}
            className="btn-main !min-w-[140px]"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}