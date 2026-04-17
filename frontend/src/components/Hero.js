"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-40"></div>
      <div className="absolute top-[-120px] left-[-120px] w-[260px] h-[260px] bg-[rgba(212,175,55,0.1)] blur-3xl rounded-full"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-[rgba(212,175,55,0.08)] blur-3xl rounded-full"></div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-6 flex justify-center px-4"
          >
            <Image
              src="/logo.png"
              alt="Rinifaza Store"
              width={750}
              height={300}
              className="object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.5)] w-full max-w-[320px] sm:max-w-[500px] md:max-w-[650px] lg:max-w-[750px] h-auto"
              priority
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="mt-6 max-w-2xl mx-auto text-[rgba(251,245,183,0.7)] text-base md:text-lg leading-8"
          >
            Discover a sleek shopping experience with premium visuals, modern
            interface, and smooth navigation built for style and performance. All in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/products" className="btn-main">
              Check our Products
            </Link>

            <Link href="/register" className="btn-secondary">
              Register Now !
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.25 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <div className="glass rounded-3xl p-6 text-left">
              <p className="text-sm text-white/50">Collections</p>
              <h3 className="mt-2 text-2xl font-semibold">Curated Drops</h3>
              <p className="mt-3 text-white/60 leading-7">
                Carefully selected products with a premium visual style.
              </p>
            </div>

            <div className="glass rounded-3xl p-6 text-left">
              <p className="text-sm text-white/50">Experience</p>
              <h3 className="mt-2 text-2xl font-semibold">Smooth Shopping</h3>
              <p className="mt-3 text-white/60 leading-7">
                Fast navigation, modern cards, and a clean dark interface.
              </p>
            </div>

            <div className="glass rounded-3xl p-6 text-left">
              <p className="text-sm text-white/50">Quality</p>
              <h3 className="mt-2 text-2xl font-semibold">Premium Feel</h3>
              <p className="mt-3 text-white/60 leading-7">
                A stylish storefront inspired by sleek portfolio aesthetics.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}