"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import API_URL from "../../utils/api";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
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
          className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
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