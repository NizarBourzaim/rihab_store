"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useUserInfo } from "../hooks/useUserInfo";
import { clearStoredUserInfo } from "../utils/userInfo";

export default function Navbar() {
  const { t, language, changeLanguage } = useLanguage();
  const cart = useCart() || {};
  const cartItems = Array.isArray(cart.cartItems) ? cart.cartItems : [];

  const userInfo = useUserInfo();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const totalQty = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);

  const handleLogout = () => {
    clearStoredUserInfo();
    window.location.href = "/";
  };

  const languages = [
    { code: "en", label: "EN", flag: "🇬🇧" },
    { code: "fr", label: "FR", flag: "🇫🇷" },
    { code: "ar", label: "AR", flag: "🇲🇦" },
  ];

  return (
    <header className="w-full border-b border-white/10 backdrop-blur sticky top-0 z-50">
      <div className="container-custom flex justify-between items-center py-4">
        <Link href="/" className="text-gold-gradient uppercase shrink-0" style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 600, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
          Rinifaza Store
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-gold-gradient transition-all">{t("home")}</Link>
          <Link href="/about" className="hover:text-gold-gradient transition-all">{t("about")}</Link>
          <Link href="/products" className="hover:text-gold-gradient transition-all">{t("products")}</Link>
          <Link href="/cart" className="hover:text-gold-gradient transition-all">{t("cart")}</Link>

          {!userInfo ? (
            <>
              <Link href="/login" className="hover:text-gold-gradient transition-all">{t("login")}</Link>
              <Link href="/register" className="hover:text-gold-gradient transition-all">{t("register")}</Link>
            </>
          ) : (
            <>
              {(userInfo.isAdmin || userInfo.isOrderManager) && (
                <Link href="/admin" className="hover:text-gold-gradient transition-all">
                  {userInfo.isAdmin ? t("admin") : t("orderManagement")}
                </Link>
              )}
              <Link href="/profile" className="text-white/70 hover:text-white transition-all">{userInfo.name}</Link>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1.5 rounded-lg transition-all"
              >
                {t("logout")}
              </button>
            </>
          )}

          {/* Language Switcher */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-white transition-all"
            >
              <span>{languages.find(l => l.code === language)?.flag}</span>
              <span className="font-semibold">{languages.find(l => l.code === language)?.label}</span>
            </button>
            
            {isLangOpen && (
              <div className="absolute top-full mt-2 right-0 bg-black/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl z-[60] min-w-[120px]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gold/10 transition-colors text-left ${language === lang.code ? 'text-gold' : 'text-white/70'}`}
                  >
                    <span>{lang.flag}</span>
                    <span className="font-medium">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/cart" className="relative text-xl hover:scale-110 transition-transform">
            🛒
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full ring-2 ring-black">
                {totalQty}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-4">
          {/* Mobile Language Switcher */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-white text-sm"
            >
              <span>{languages.find(l => l.code === language)?.flag}</span>
            </button>
            {isLangOpen && (
              <div className="absolute top-full mt-2 right-0 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[60] min-w-[100px]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gold/10 transition-colors"
                  >
                    <span>{lang.flag}</span>
                    <span className="text-white text-sm">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/cart" className="relative text-xl mr-2">
            🛒
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full ring-2 ring-black">
                {totalQty}
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-4 px-6 flex flex-col gap-4">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-gold-gradient transition-all">{t("home")}</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-gold-gradient transition-all">{t("about")}</Link>
          <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-gold-gradient transition-all">{t("products")}</Link>
          <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-gold-gradient transition-all">{t("cart")}</Link>

          {!userInfo ? (
            <div className="flex flex-col gap-3 mt-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-2 bg-white/10 rounded-xl">{t("login")}</Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-2 btn-main">{t("register")}</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {(userInfo.isAdmin || userInfo.isOrderManager) && (
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5 text-gold-gradient font-semibold">
                  {userInfo.isAdmin ? t("adminDashboard") : t("orderManagementDashboard")}
                </Link>
              )}
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5">{t("profile")} ({userInfo.name})</Link>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="text-center py-2 mt-2 bg-red-600/20 text-red-500 rounded-xl"
              >
                {t("logout")}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}