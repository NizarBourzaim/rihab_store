"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../utils/api";
import { getStoredUserInfo, storeUserInfo, clearStoredUserInfo } from "../../utils/userInfo";
import BackButton from "../../components/BackButton";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUserInfo = getStoredUserInfo();

        if (!storedUserInfo?.token) {
          window.location.href = "/login";
          return;
        }

        setUserInfo(storedUserInfo);

        const { data } = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedUserInfo.token}`,
          },
        });

        setForm((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
        }));
      } catch {
        clearStoredUserInfo();
        window.location.href = "/login";
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const storedUserInfo = getStoredUserInfo();
      if (!storedUserInfo?.token) {
        window.location.href = "/login";
        return;
      }

      const { data } = await axios.put(
        `${API_URL}/api/auth/me`,
        {
          name: form.name,
          email: form.email,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${storedUserInfo.token}`,
          },
        }
      );

      storeUserInfo(data);
      setUserInfo(data);
      setMessage("Profile updated successfully");
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearStoredUserInfo();
    window.location.href = "/login";
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden py-16">
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto glass rounded-[32px] p-8 md:p-10">
            <BackButton fallbackUrl="/" />
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-gold-gradient">
              Profile Settings
            </h1>

            {loadingProfile ? (
              <p className="mt-8 text-center text-white/70">Loading profile...</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3"
                    placeholder="Full Name"
                  />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3"
                    placeholder="Email Address"
                  />

                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) =>
                      setForm({ ...form, currentPassword: e.target.value })
                    }
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3"
                    placeholder="Current Password"
                  />

                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm({ ...form, newPassword: e.target.value })
                    }
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3"
                    placeholder="New Password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-main w-full mt-6"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary w-full mt-3"
                >
                  Logout
                </button>

                {message && (
                  <p className="mt-4 text-center text-sm text-white/70">
                    {message}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
  );
}