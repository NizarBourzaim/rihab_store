"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import API_URL from "../../utils/api";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data } = await axios.post(`${API_URL}/api/auth/login`, form);
    localStorage.setItem("userInfo", JSON.stringify(data));
    window.dispatchEvent(new Event("userInfoUpdated"));

    if (data.isAdmin) {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-10 glass rounded-3xl text-white">
      <h1 className="text-3xl font-bold mb-6 text-gold-gradient">Login</h1>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <input
          className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn-main mt-4">Login</button>
      </form>
    </div>
  );
}