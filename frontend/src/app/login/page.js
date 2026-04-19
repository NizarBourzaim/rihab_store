"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import API_URL from "../../utils/api";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, form);
      localStorage.setItem("userInfo", JSON.stringify(data));
      window.dispatchEvent(new Event("userInfoUpdated"));

      if (data.isAdmin || data.isOrderManager) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-10 glass rounded-3xl text-white">
      <h1 className="text-3xl font-bold mb-6 text-gold-gradient">Login</h1>

      {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="grid gap-5">
        <input
          className="w-full border border-white/20 bg-white p-4 rounded-2xl text-black placeholder-black/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <div className="relative">
          <input
            className="w-full border border-white/20 bg-white p-4 rounded-2xl text-black placeholder-black/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <button className="btn-main mt-4">Login</button>
      </form>

      <div className="mt-6 flex flex-col gap-3 text-center text-sm">
        <Link href="/forgot-password" ring-offset-2 className="text-white/50 hover:text-white transition-colors">
          Forgot Password?
        </Link>
        <div className="text-white/30">
          Don't have an account?{" "}
          <Link href="/register" className="text-gold-gradient font-bold hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}