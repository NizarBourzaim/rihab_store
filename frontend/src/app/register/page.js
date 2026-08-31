"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import API_URL from "../../utils/api";
import { useLanguage } from "../../context/LanguageContext";
import BackButton from "../../components/BackButton";

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post(`${API_URL}/api/auth/register`, form);

      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      setMessage(error.response?.data?.message || t("registrationFailed"));
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden py-16">
      <div className="container-custom relative z-10">
        <div className="max-w-md mx-auto glass rounded-[32px] p-8 md:p-10">
          <BackButton fallbackUrl="/" />
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-gold-gradient">
            {t("joinRinifaza")}
          </h1>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder={t("enterFullName")}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-white/50"
                required
              />

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-white/50"
                required
              />

              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder={t("passwordPlaceholder")}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-white/50"
                required
              />

              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                placeholder={t("yourPhone")}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-white/50"
                required
              />

              <textarea
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder={t("yourAddress")}
                rows={3}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-white/50 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-main w-full mt-6"
            >
              {loading ? t("creatingAccount") : t("register")}
            </button>

            {message && (
              <p className="mt-4 text-center text-sm text-white/70">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}