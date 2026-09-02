"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import API_URL from "../../utils/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import { storeUserInfo } from "../../utils/userInfo";
import BackButton from "../../components/BackButton";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setVerifying(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/verify-email`, {
        email,
        code,
      });

      storeUserInfo(data);
      setMessage(t("accountVerifiedSuccess"));

      if (data.isAdmin || data.isOrderManager) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || t("verificationFailed"));
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setError("");
    setMessage("");
    setResending(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/resend-verification`, {
        email,
      });
      setMessage(data.message || t("codeResent"));
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || t("error"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-20 glass rounded-3xl text-white">
      <BackButton fallbackUrl="/login" />
      <h1 className="text-3xl font-bold mb-4 text-gold-gradient">{t("verifyEmailTitle")}</h1>

      <p className="text-sm text-white/60 mb-6">
        {t("verifyEmailInstructions")} <span className="text-white font-semibold">{email}</span>
      </p>

      {message && (
        <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-2xl text-green-200 text-sm mb-6 text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl text-red-200 text-sm mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="grid gap-5">
        <input
          className="w-full border border-white/20 bg-white p-4 rounded-2xl text-black text-center text-2xl tracking-[0.5em] placeholder-black/30 focus:border-[rgba(212,175,55,0.5)] focus:ring-1 focus:ring-[rgba(212,175,55,0.5)] outline-none transition-all"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder={t("verificationCodePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
        />

        <button
          type="submit"
          disabled={verifying || code.length !== 6}
          className="btn-main mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? t("verifying") : t("verifyAccount")}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="text-white/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `${t("resendCodeIn")} ${cooldown}s` : t("resendCode")}
        </button>
      </div>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-white">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
