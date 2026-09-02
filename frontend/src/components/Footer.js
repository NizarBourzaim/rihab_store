"use client";

import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 mt-10">
      <div className="container-custom py-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
        <div className="flex-1 w-full text-center md:text-left">
          <h3 className="text-lg font-semibold text-gold-gradient">Rinifaza Store</h3>
          <p className="text-white/50 text-sm mt-1">
            {t("footerMission")}
          </p>
        </div>

        <div className="flex-1 w-full flex justify-center order-first md:order-none">
          <span className="inline-block px-4 py-2 rounded-full border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] text-sm text-[rgba(251,245,183,0.8)] shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            {t("officialWebsite")}
          </span>
        </div>

        <div className="flex-1 w-full text-center md:text-right text-white/50 text-sm">
          © 2026 Rinifaza. {t("allRightsReserved")}
        </div>
      </div>
    </footer>
  );
}