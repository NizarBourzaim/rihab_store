"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../utils/translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  function updateDocumentDirection(lang) {
    if (typeof document !== "undefined") {
      const dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
    }
  }

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && ["en", "fr", "ar"].includes(savedLanguage)) {
      setTimeout(() => {
        setLanguage(savedLanguage);
        updateDocumentDirection(savedLanguage);
      }, 0);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    updateDocumentDirection(lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
