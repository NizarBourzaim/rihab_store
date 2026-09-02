"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function BackButton({ className = "", fallbackUrl = "/" }) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 mb-6 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-all group cursor-pointer ${className}`}
    >
      <svg
        className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1 text-[#D4AF37]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>{t("previous")}</span>
    </button>
  );
}

