"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar";
import { useCart } from "../../../context/CartContext";
import { useParams } from "next/navigation";
import API_URL from "../../../utils/api";
import { useLanguage } from "../../../context/LanguageContext";

export default function ProductDetailsClient({ initialProduct }) {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const params = useParams();
  const [product, setProduct] = useState(initialProduct);

  useEffect(() => {
    if (!params?.id) return;

    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/products/${params.id}`
        );
        setProduct(data);
      } catch (error) {
        console.error("Refresh failed:", error);
      }
    };

    // Even if we have initialProduct, we refresh to get the absolute latest (e.g. from an edit)
    fetchProduct();
  }, [params?.id]);

  if (!product) {
    return (
      <>
        <Navbar />
        <section className="py-20">
          <div className="container-custom">
            <div className="glass rounded-3xl p-8 text-white/70">
              {t("loading")}...
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="glass rounded-[28px] p-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[500px] object-cover rounded-2xl"
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

              <button
                onClick={() => addToCart(product)}
                className="btn-main mt-8 w-full"
              >
                {t("addToCart")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
