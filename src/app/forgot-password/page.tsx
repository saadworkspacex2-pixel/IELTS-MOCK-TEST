"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import SpringHeading from "@/components/SpringHeading";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const input = "mt-1.5 w-full rounded-md px-4 py-3 text-sm outline-none";

  const requestCode = async () => {
    setLoading(true); setMessage("");
    const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setMessage(data.error || "অনুরোধ পাঠানো যায়নি");
    setSent(true); setMessage("এই ইমেইলটি নিবন্ধিত হলে ৬ সংখ্যার OTP পাঠানো হয়েছে।");
  };
  const reset = async () => {
    setLoading(true); setMessage("");
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code, password }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setMessage(data.error || "পাসওয়ার্ড পরিবর্তন করা যায়নি");
    router.replace("/login");
  };

  return <main className="grid min-h-screen place-items-center bg-white px-4 py-10"><section data-tour="forgot-card" className="anim-pop card w-full max-w-md rounded-xl p-8"><div className="text-center"><span className="mx-auto inline-block"><LogoMark size={48} /></span><SpringHeading as="h1" className="mt-4 text-2xl font-bold">পাসওয়ার্ড রিসেট</SpringHeading><p className="mt-2 text-sm text-[#6C757D]">রেজিস্টার করা ইমেইলে ৬ সংখ্যার নিরাপত্তা কোড পাঠানো হবে।</p></div><div className="mt-7 space-y-4"><div><label className="text-sm font-medium">ইমেইল</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className={input} /></div>{sent && <><div><label className="text-sm font-medium">OTP কোড</label><input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="৬ সংখ্যার কোড" className={input} /></div><div><label className="text-sm font-medium">নতুন পাসওয়ার্ড</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" className={input} /></div></>}{message && <p className={`rounded-md px-3 py-2 text-xs ${message.includes("পাঠানো") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{message}</p>}<button onClick={sent ? reset : requestCode} disabled={loading} className="btn-red w-full rounded-md py-3.5 text-sm font-bold disabled:opacity-60">{loading ? "অপেক্ষা করুন…" : sent ? "নতুন পাসওয়ার্ড সংরক্ষণ করুন" : "OTP কোড পাঠান"}</button>{sent && <button onClick={requestCode} disabled={loading} className="w-full text-xs font-bold text-[#E51A24] hover:underline">কোড আবার পাঠান</button>}</div><p className="mt-6 text-center text-xs"><Link href="/login" className="font-bold text-[#6C757D] hover:text-[#E51A24]">← লগইনে ফিরে যান</Link></p></section></main>;
}
