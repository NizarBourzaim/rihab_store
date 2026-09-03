"use client";

import { useState, useEffect, useRef } from "react";
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
  const navRef = useRef(null);

  const totalQty = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);

  const handleLogout = () => {
    clearStoredUserInfo();
    window.location.href = "/";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsLangOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLangOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);


  const languages = [
    { code: "en", label: "EN", flag: "🇬🇧" },
    { code: "fr", label: "FR", flag: "🇫🇷" },
    { code: "ar", label: "AR", flag: "🇲🇦" },
  ];

  const socialLinks = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/rinifaza_store/",
      color: "text-[#E1306C] hover:bg-[#E1306C]/15 hover:text-[#FF6B9A]",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/212779706722",
      color: "text-[#25D366] hover:bg-[#25D366]/15 hover:text-[#69F08F]",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />
          <path d="M8.5 8.5c.3-.5.7-.5 1-.1l.8 1c.2.3.2.6 0 .9l-.4.5c.5 1 1.3 1.8 2.3 2.3l.5-.4c.3-.2.6-.2.9 0l1 .8c.4.3.4.7-.1 1-.6.5-1.4.6-2.1.3-2.3-.9-4.1-2.7-5-5-.3-.7-.2-1.5.3-2.1Z" />
        </svg>
      ),
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@rinifaza_store",
      color: "text-[#FE2C55] hover:bg-[#FE2C55]/15 hover:text-[#FF6685]",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M15.2 3c.3 1.8 1.3 3.1 3 3.7.6.2 1.2.3 1.8.3v3.1a8.6 8.6 0 0 1-4.8-1.5v6.2a5.2 5.2 0 1 1-4.5-5.2v3.2a2 2 0 1 0 1.4 1.9V3h3.1Z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/people/Rinifaza/61591158377129/",
      color: "text-[#1877F2] hover:bg-[#1877F2]/15 hover:text-[#5B9DF5]",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.2Z" />
        </svg>
      ),
    },
  ];

  const socialIcons = (className = "") => (
    <div className={`${className} flex items-center gap-2 border-r border-white/10 pr-3`} aria-label="Social links">
      {socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.label}
          title={social.label}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:scale-125 hover:drop-shadow-[0_0_8px_currentColor] ${social.color}`}
        >
          {social.icon}
        </a>
      ))}
      <span
        aria-label="Email coming soon"
        title="Professional email coming soon"
        className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-full text-white/25"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </span>
    </div>
  );

  return (
    <header ref={navRef} className="w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container-custom flex justify-between items-center py-3.5">
        <Link
          href="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-gold-gradient uppercase shrink-0"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)",
            fontWeight: 600,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
          }}
        >
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
                type="button"
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
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-white transition-all cursor-pointer"
            >
              <span>{languages.find(l => l.code === language)?.flag}</span>
              <span className="font-semibold">{languages.find(l => l.code === language)?.label}</span>
            </button>
            
            {isLangOpen && (
              <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-black/95 border border-white/15 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl z-[60] min-w-[120px]">
                {languages.map((lang) => (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left rtl:text-right cursor-pointer ${
                      language === lang.code ? 'text-[#D4AF37] font-bold' : 'text-white/70'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="font-medium">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {socialIcons()}

          <Link href="/cart" className="relative text-xl hover:scale-110 transition-transform" aria-label="Cart">
            🛒
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full ring-2 ring-black">
                {totalQty}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-2 sm:gap-3">
          {/* Mobile Language Switcher */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-label="Select language"
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-xl text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <span>{languages.find(l => l.code === language)?.flag}</span>
              <span>{languages.find(l => l.code === language)?.label}</span>
            </button>
            {isLangOpen && (
              <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-[#111] border border-white/15 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl z-[70] min-w-[110px]">
                {languages.map((lang) => (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left rtl:text-right hover:bg-[#D4AF37]/10 transition-colors text-xs cursor-pointer ${
                      language === lang.code ? 'text-[#D4AF37] font-bold' : 'text-white/80'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart button */}
          <Link
            href="/cart"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Shopping Cart"
            className="relative p-2 text-xl hover:scale-105 active:scale-95 transition-transform"
          >
            🛒
            {totalQty > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white font-bold text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full ring-2 ring-black">
                {totalQty}
              </span>
            )}
          </Link>

          {/* Hamburger / Close toggle */}
          <button 
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsLangOpen(false);
            }}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="p-2 text-white/90 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop and Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-[59px] bg-black/70 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="md:hidden absolute top-full left-0 w-full bg-[#0d0d0d]/98 backdrop-blur-2xl border-b border-white/10 shadow-2xl py-5 px-6 flex flex-col gap-2 z-50 max-h-[calc(100vh-70px)] overflow-y-auto">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-white/5 hover:text-gold-gradient font-medium text-base transition-all"
            >
              {t("home")}
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-white/5 hover:text-gold-gradient font-medium text-base transition-all"
            >
              {t("about")}
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-white/5 hover:text-gold-gradient font-medium text-base transition-all"
            >
              {t("products")}
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 border-b border-white/5 hover:text-gold-gradient font-medium text-base flex items-center justify-between transition-all"
            >
              <span>{t("cart")}</span>
              {totalQty > 0 && (
                <span className="bg-[#D4AF37]/20 text-[#FBF5B7] border border-[#D4AF37]/35 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {totalQty}
                </span>
              )}
            </Link>

            {!userInfo ? (
              <div className="flex flex-col gap-3 pt-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 btn-main text-sm"
                >
                  {t("register")}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-3">
                {(userInfo.isAdmin || userInfo.isOrderManager) && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 border-b border-white/5 text-gold-gradient font-semibold"
                  >
                    {userInfo.isAdmin ? t("adminDashboard") : t("orderManagementDashboard")}
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 border-b border-white/5 text-white/80"
                >
                  {t("profile")} ({userInfo.name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-center py-2.5 mt-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  {t("logout")}
                </button>
              </div>
            )}

            {/* Social Icons inside Mobile Menu */}
            <div className="pt-4 mt-3 border-t border-white/10 flex justify-center items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-all ${social.color}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );

}