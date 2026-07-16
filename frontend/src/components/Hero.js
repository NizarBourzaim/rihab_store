"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 hero-grid opacity-40"></div>
      <div className="absolute top-[-120px] left-[-120px] w-[260px] h-[260px] bg-[rgba(212,175,55,0.1)] blur-3xl rounded-full"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-[rgba(212,175,55,0.08)] blur-3xl rounded-full"></div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-6 flex justify-center"
          >
            <Image
              src="/logo.png"
              alt="Rinifaza Store"
              width={1872}
              height={546}
              className="object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.5)] w-full max-w-[420px] sm:max-w-[600px] md:max-w-[750px] lg:max-w-[900px] h-auto"
              priority
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="mt-6 max-w-2xl mx-auto text-[rgba(251,245,183,0.7)] text-base md:text-lg leading-8"
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/products" className="btn-main">
              {t("checkProducts")}
            </Link>

            <Link href="/register" className="btn-secondary">
              {t("registerNow")}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.25 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <div className="glass rounded-3xl p-6 text-start">
              <p className="text-sm text-white/50">{t("feature1Sub")}</p>
              <h3 className="mt-2 text-2xl font-semibold">{t("feature1Title")}</h3>
              <p className="mt-3 text-white/60 leading-7">
                {t("feature1Desc")}
              </p>
            </div>

            <div className="glass rounded-3xl p-6 text-start">
              <p className="text-sm text-white/50">{t("feature2Sub")}</p>
              <h3 className="mt-2 text-2xl font-semibold">{t("feature2Title")}</h3>
              <p className="mt-3 text-white/60 leading-7">
                {t("feature2Desc")}
              </p>
            </div>

            <div className="glass rounded-3xl p-6 text-start">
              <p className="text-sm text-white/50">{t("feature3Sub")}</p>
              <h3 className="mt-2 text-2xl font-semibold">{t("feature3Title")}</h3>
              <p className="mt-3 text-white/60 leading-7">
                {t("feature3Desc")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}