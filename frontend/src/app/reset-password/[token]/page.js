"use client";

import { useState } from "react";
import axios from "axios";
import API_URL from "../../../utils/api";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/reset-password`, { 
        token, 
        password 
      });
      setMessage(data.message);
      setLoading(false);
      
      // Redirect to login after success
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Link might be expired.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-20 glass rounded-3xl text-white">
      <h1 className="text-3xl font-bold mb-6 text-gold-gradient">New Password</h1>
      <p className="text-white/60 mb-8 text-sm leading-6">
        Please enter your new password below.
      </p>

      {message && (
        <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-2xl text-green-200 text-sm mb-6 text-center">
          {message}. Redirecting to login...
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl text-red-200 text-sm mb-6 text-center">
          {error}
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className="grid gap-5">
          <input
            className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <input
            className="border border-white/20 bg-white/5 p-4 rounded-2xl text-white placeholder-white/50 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          <button 
            disabled={loading}
            className={`btn-main mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      <div className="mt-8 text-center">
        <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
