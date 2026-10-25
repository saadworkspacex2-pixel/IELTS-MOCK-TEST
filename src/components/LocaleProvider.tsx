"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AppLocale } from "@/lib/locale";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: AppLocale; children: ReactNode }) {
  const [locale, setCurrentLocale] = useState<AppLocale>(initialLocale);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale: async (nextLocale) => {
      if (nextLocale === locale) return;
      setCurrentLocale(nextLocale);
      document.documentElement.lang = nextLocale;
      try {
        await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: nextLocale }),
        });
      } finally {
        // A full navigation makes server-rendered pages, metadata and all
        // client islands consistently use the saved language preference.
        window.location.reload();
      }
    },
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
