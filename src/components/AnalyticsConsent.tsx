"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "lhbd-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(!localStorage.getItem(KEY)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const choose = (value: "accepted" | "essential") => {
    localStorage.setItem(KEY, value);
    window.dispatchEvent(new CustomEvent("lhbd-cookie-consent", { detail: value }));
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl rounded-xl border border-black/10 bg-white p-4 shadow-2xl sm:bottom-5 sm:p-5" role="dialog" aria-label="Cookie consent">
      <p className="font-semibold text-[#1A1A1A]">কুকি পছন্দ</p>
      <p className="mt-1 text-xs leading-relaxed text-[#6C757D]">
        সাইট চালাতে জরুরি কুকি ব্যবহার করা হয়। আপনি অনুমতি দিলে ভিজিটর ব্যবহারের তথ্য বিশ্লেষণেও সাহায্য করবে। বিস্তারিত আমাদের প্রাইভেসি পলিসিতে আছে।
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => choose("accepted")} className="btn-red rounded-md px-4 py-2 text-xs font-bold">সব গ্রহণ করুন</button>
        <button onClick={() => choose("essential")} className="skeuo-key rounded-md px-4 py-2 text-xs font-bold">শুধু জরুরি</button>
      </div>
    </div>
  );
}

export function Analytics({ measurementId }: { measurementId?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(localStorage.getItem(KEY) === "accepted");
    sync();
    window.addEventListener("lhbd-cookie-consent", sync);
    return () => window.removeEventListener("lhbd-cookie-consent", sync);
  }, []);

  if (!measurementId || !enabled) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${measurementId}');`}
      </Script>
    </>
  );
}
