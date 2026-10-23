"use client";

import { useEffect, useState } from "react";

const tiers = [
  { key: "starter", fallback: "Premium Starter" },
  { key: "plus", fallback: "Premium Plus" },
  { key: "pro", fallback: "Premium Pro" },
] as const;

const fields = [
  "payment_bkash_number",
  "payment_nagad_number",
  "payment_rocket_number",
  "payment_upay_number",
  "payment_instruction",
] as const;

export default function PremiumSettingsPanel() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { fetch("/api/settings").then((r) => r.json()).then(setValues).finally(() => setLoading(false)); }, []);
  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const save = async () => {
    setSaving(true); setNotice("");
    const body: Record<string, string> = {};
    for (const tier of tiers) for (const suffix of ["name", "price", "duration", "features"]) body[`premium_${tier.key}_${suffix}`] = values[`premium_${tier.key}_${suffix}`] ?? "";
    for (const key of fields) body[key] = values[key] ?? "";
    const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false); setNotice(res.ok ? "Premium সেটিংস সংরক্ষিত হয়েছে।" : "সংরক্ষণ ব্যর্থ হয়েছে।");
  };
  const input = "mt-1 w-full rounded-md px-3 py-2 text-sm";
  if (loading) return <div className="mt-7 grid gap-4 lg:grid-cols-2"><div className="shimmer h-72 rounded-xl" /><div className="shimmer h-72 rounded-xl" /></div>;
  return <div className="mt-7 grid gap-5 lg:grid-cols-2"><section data-tour="admin-tiers-editor" className="card rounded-xl p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">৩টি Premium টায়ার</h2><p className="mt-1 text-xs text-[#6C757D]">নাম, মূল্য, মেয়াদ ও অন্তর্ভুক্ত সুবিধা এখান থেকে লিখুন।</p></div></div><div className="mt-5 space-y-5">{tiers.map((tier) => <fieldset key={tier.key} className="rounded-lg border border-black/10 p-4"><legend className="px-1 text-sm font-bold text-[#E51A24]">{tier.fallback}</legend><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-[#6C757D]">নাম<input value={values[`premium_${tier.key}_name`] ?? ""} onChange={(e) => set(`premium_${tier.key}_name`, e.target.value)} placeholder={tier.fallback} className={input} /></label><label className="text-xs font-bold text-[#6C757D]">মূল্য (BDT)<input value={values[`premium_${tier.key}_price`] ?? ""} onChange={(e) => set(`premium_${tier.key}_price`, e.target.value)} placeholder="যেমন: 500" className={input} /></label><label className="text-xs font-bold text-[#6C757D]">মেয়াদ<input value={values[`premium_${tier.key}_duration`] ?? ""} onChange={(e) => set(`premium_${tier.key}_duration`, e.target.value)} placeholder="যেমন: 30 দিন" className={input} /></label><label className="text-xs font-bold text-[#6C757D]">সুবিধা<textarea rows={2} value={values[`premium_${tier.key}_features`] ?? ""} onChange={(e) => set(`premium_${tier.key}_features`, e.target.value)} placeholder="এক লাইন বা প্রতিটি সুবিধা নতুন লাইনে" className={input} /></label></div></fieldset>)}</div></section><section data-tour="admin-bd-methods" className="card rounded-xl p-6"><h2 className="font-bold">Bangladesh Send Money</h2><p className="mt-1 text-xs text-[#6C757D]">শিক্ষার্থীরা এই নম্বরগুলো One-Tap Copy করে তাদের পেমেন্ট অ্যাপ থেকে Send Money করবে।</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{[["payment_bkash_number", "bKash নম্বর"],["payment_nagad_number", "Nagad নম্বর"],["payment_rocket_number", "Rocket নম্বর"],["payment_upay_number", "Upay নম্বর"]].map(([key,label]) => <label key={key} className="text-xs font-bold text-[#6C757D]">{label}<input value={values[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder="01XXXXXXXXX" className={input} /></label>)}<label className="sm:col-span-2 text-xs font-bold text-[#6C757D]">পেমেন্ট নির্দেশনা<textarea rows={4} value={values.payment_instruction ?? ""} onChange={(e) => set("payment_instruction", e.target.value)} placeholder="যেমন: টাকা পাঠিয়ে TrxID জমা দিন।" className={input} /></label></div><div className="mt-6 flex items-center gap-3"><button onClick={save} disabled={saving} className="btn-red rounded-md px-5 py-2.5 text-sm font-bold disabled:opacity-60">{saving ? "সংরক্ষণ হচ্ছে…" : "সব Premium সেটিংস সংরক্ষণ"}</button>{notice && <span className="text-xs font-bold text-emerald-700">{notice}</span>}</div></section></div>;
}
