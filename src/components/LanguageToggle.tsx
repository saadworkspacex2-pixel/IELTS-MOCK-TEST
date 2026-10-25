"use client";

import { useState } from "react";
import { useLocale } from "./LocaleProvider";

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  const [switching, setSwitching] = useState(false);

  const choose = async (nextLocale: "bn" | "en") => {
    if (switching || nextLocale === locale) return;
    setSwitching(true);
    await setLocale(nextLocale);
  };

  return (
    <div
      className={`skeuo-well inline-flex items-center rounded-full p-1 ${compact ? "text-[11px]" : "text-xs"}`}
      aria-label={locale === "bn" ? "ভাষা নির্বাচন" : "Language selector"}
    >
      <button
        type="button"
        onClick={() => void choose("bn")}
        disabled={switching}
        aria-pressed={locale === "bn"}
        className={`rounded-full px-2.5 py-1.5 font-extrabold transition disabled:cursor-wait ${locale === "bn" ? "bg-[#1A1A1A] text-white shadow" : "text-slate-600 hover:text-[#1A1A1A]"}`}
      >
        বাংলা
      </button>
      <button
        type="button"
        onClick={() => void choose("en")}
        disabled={switching}
        aria-pressed={locale === "en"}
        className={`rounded-full px-2.5 py-1.5 font-extrabold transition disabled:cursor-wait ${locale === "en" ? "bg-[#1A1A1A] text-white shadow" : "text-slate-600 hover:text-[#1A1A1A]"}`}
      >
        EN
      </button>
    </div>
  );
}
