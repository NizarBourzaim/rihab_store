"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  const values = [
    { sub: t("aboutValue1Sub"), title: t("aboutValue1Title"), desc: t("aboutValue1Desc") },
    { sub: t("aboutValue2Sub"), title: t("aboutValue2Title"), desc: t("aboutValue2Desc") },
    { sub: t("aboutValue3Sub"), title: t("aboutValue3Title"), desc: t("aboutValue3Desc") },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute top-[-120px] left-[-120px] w-[260px] h-[260px] bg-[rgba(212,175,55,0.1)] blur-3xl rounded-full"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-[rgba(212,175,55,0.08)] blur-3xl rounded-full"></div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[rgba(251,245,183,0.7)]">
            {t("aboutEyebrow")}
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-gold-gradient">
            {t("aboutTitle")}
          </h1>
          <p className="mt-6 text-white/60 text-base md:text-lg leading-8">
            {t("aboutIntro")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto mt-14 glass rounded-[32px] p-8 md:p-12"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-gold-gradient">
            {t("aboutStoryTitle")}
          </h2>
          <p className="mt-4 text-white/70 text-lg italic leading-8">
            {t("aboutStoryIntro")}
          </p>

          <h3 className="mt-10 text-xl font-semibold text-white">
            {t("aboutStorySection1Title")}
          </h3>
          <p className="mt-4 text-white/60 leading-8">
            {t("aboutStorySection1Para1")}
          </p>
          <p className="mt-4 text-white/60 leading-8">
            {t("aboutStorySection1Para2")}
          </p>

          <h3 className="mt-10 text-xl font-semibold text-white">
            {t("aboutStorySection2Title")}
          </h3>
          <p className="mt-4 text-white/60 leading-8">
            {t("aboutStorySection2Para1")}
          </p>
          <p className="mt-4 text-white/60 leading-8">
            {t("aboutStorySection2Para2")}
          </p>
          <p className="mt-4 text-white/60 leading-8">
            {t("aboutStorySection2Para3")}
          </p>

          <blockquote className="mt-8 border-l-2 border-[rgba(212,175,55,0.5)] pl-6 text-xl md:text-2xl font-medium text-gold-gradient italic leading-relaxed">
            {t("aboutStorySection2Quote")}
          </blockquote>

          <h3 className="mt-10 text-xl font-semibold text-white">
            {t("aboutStorySection3Title")}
          </h3>
          <p className="mt-4 text-white/60 leading-8">
            {t("aboutStorySection3Para1")}
          </p>
          <p className="mt-4 text-white/60 leading-8">
            {t("aboutStorySection3Para2")}
          </p>
          <p className="mt-4 text-white/60 leading-8">
            {t("aboutStorySection3Para3")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {values.map((value) => (
            <div key={value.title} className="glass rounded-3xl p-6 text-start">
              <p className="text-sm text-white/50">{value.sub}</p>
              <h3 className="mt-2 text-2xl font-semibold">{value.title}</h3>
              <p className="mt-3 text-white/60 leading-7">{value.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {t("aboutCtaTitle")}
          </h2>
          <Link href="/products" className="btn-main mt-8 inline-flex">
            {t("checkProducts")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
