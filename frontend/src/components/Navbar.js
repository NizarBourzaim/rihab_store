"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const cart = useCart() || {};
  const cartItems = Array.isArray(cart.cartItems) ? cart.cartItems : [];

  const [userInfo, setUserInfo] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadUserInfo = () => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("userInfo")
        : null;

    setUserInfo(stored ? JSON.parse(stored) : null);
  };

  useEffect(() => {
    loadUserInfo();

    const handleUserInfoUpdated = () => {
      loadUserInfo();
    };

    window.addEventListener("userInfoUpdated", handleUserInfoUpdated);
    window.addEventListener("storage", handleUserInfoUpdated);

    return () => {
      window.removeEventListener("userInfoUpdated", handleUserInfoUpdated);
      window.removeEventListener("storage", handleUserInfoUpdated);
    };
  }, []);

  const totalQty = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.dispatchEvent(new Event("userInfoUpdated"));
    window.location.href = "/";
  };

  return (
    <header className="w-full border-b border-white/10 backdrop-blur sticky top-0 z-50">
      <div className="container-custom flex justify-between items-center py-4">
        <Link href="/" className="text-gold-gradient uppercase shrink-0" style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", fontWeight: 600, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
          Rinifaza Store
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-gold-gradient transition-all">Home</Link>
          <Link href="/products" className="hover:text-gold-gradient transition-all">Products</Link>
          <Link href="/cart" className="hover:text-gold-gradient transition-all">Cart</Link>

          {!userInfo ? (
            <>
              <Link href="/login" className="hover:text-gold-gradient transition-all">Login</Link>
              <Link href="/register" className="hover:text-gold-gradient transition-all">Register</Link>
            </>
          ) : (
            <>
              {userInfo.isAdmin && <Link href="/admin" className="hover:text-gold-gradient transition-all">Admin</Link>}
              <Link href="/profile" className="text-white/70 hover:text-white transition-all">{userInfo.name}</Link>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1.5 rounded-lg transition-all"
              >
                Logout
              </button>
            </>
          )}

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
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-gold-gradient transition-all">Home</Link>
          <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-gold-gradient transition-all">Products</Link>
          <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-gold-gradient transition-all">Cart</Link>

          {!userInfo ? (
            <div className="flex flex-col gap-3 mt-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-2 bg-white/10 rounded-xl">Login</Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-2 btn-main">Register</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {userInfo.isAdmin && <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5 text-gold-gradient font-semibold">Admin Dashboard</Link>}
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/5">Profile ({userInfo.name})</Link>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="text-center py-2 mt-2 bg-red-600/20 text-red-500 rounded-xl"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}