"use client";

import { useEffect, useState } from "react";

type Student = { id: number; email: string; nameBn: string; nameEn: string; phone: string; membershipTier: string; premiumUntil: string | null };

export default function ManualMembershipPanel({ onUpdated }: { onUpdated: () => void }) {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [tier, setTier] = useState("starter");
  const [note, setNote] = useState("ম্যানুয়াল পেমেন্ট/অফলাইন অনুমোদন");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => { fetch("/api/settings").then((response) => response.json()).then((data) => setSettings(data)).catch(() => {}); }, []);
  const search = async () => {
    setBusy(true); setNotice("");
    const response = await fetch(`/api/admin/memberships?q=${encodeURIComponent(query)}`);
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setNotice(data.error || "শিক্ষার্থী খোঁজা যায়নি");
    setStudents(data); setSelectedId(data[0] ? String(data[0].id) : "");
    if (!data.length) setNotice("কোনো শিক্ষার্থী পাওয়া যায়নি");
  };
  const save = async () => {
    if (!selectedId) return setNotice("আগে একজন শিক্ষার্থী নির্বাচন করুন");
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/memberships", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: Number(selectedId), tier, adminNote: note }) });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setNotice(data.error || "Membership আপডেট করা যায়নি");
    setNotice(tier === "free" ? "Premium অ্যাক্সেস বন্ধ করা হয়েছে।" : "Premium সক্রিয় হয়েছে; product, price ও receipt-সহ ইমেইল পাঠানোর চেষ্টা করা হয়েছে।");
    onUpdated();
    await search();
  };
  const selected = students.find((student) => student.id === Number(selectedId));
  const label = (key: "starter" | "plus" | "pro") => settings[`premium_${key}_name`] || `Premium ${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  const input = "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";

  return <section data-tour="admin-manual-premium" className="card mt-8 rounded-xl p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">ম্যানুয়াল Premium Membership</h2><p className="mt-1 max-w-2xl text-sm text-[#6C757D]">অফলাইন পেমেন্ট বা বিশেষ অনুমোদনের জন্য একজন শিক্ষার্থী খুঁজে Tier সক্রিয়/বন্ধ করুন। Premium চালু হলে product, price এবং receipt link-সহ transactional email পাঠানো হবে।</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Admin control</span></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr_1fr_auto]"><label className="text-xs font-bold text-[#6C757D]">ইমেইল / নাম / ফোন<input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} placeholder="শিক্ষার্থী খুঁজুন" className={input} /></label><label className="text-xs font-bold text-[#6C757D]">শিক্ষার্থী<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className={input}><option value="">নির্বাচন করুন</option>{students.map((student) => <option key={student.id} value={student.id}>{student.nameBn || student.nameEn || student.email} · {student.email}</option>)}</select></label><label className="text-xs font-bold text-[#6C757D]">Membership tier<select value={tier} onChange={(event) => setTier(event.target.value)} className={input}><option value="starter">{label("starter")}</option><option value="plus">{label("plus")}</option><option value="pro">{label("pro")}</option><option value="free">Premium বন্ধ / Free</option></select></label><button type="button" onClick={search} disabled={busy} className="skeuo-key mt-5 h-11 rounded-md px-4 text-sm font-bold disabled:opacity-60">খুঁজুন</button></div>
    {selected && <p className="mt-3 text-xs text-[#6C757D]">বর্তমান: <b>{selected.membershipTier === "free" ? "Free" : `Premium ${selected.membershipTier}`}</b>{selected.premiumUntil ? ` · মেয়াদ: ${new Date(selected.premiumUntil).toLocaleDateString("bn-BD")}` : ""}</p>}
    <div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={note} onChange={(event) => setNote(event.target.value)} className="min-w-0 flex-1 rounded-md px-3 py-2.5 text-sm" placeholder="অ্যাডমিন নোট" /><button type="button" onClick={save} disabled={busy || !selectedId} className="btn-red shrink-0 rounded-md px-5 py-2.5 text-sm font-bold disabled:opacity-60">{busy ? "অপেক্ষা করুন…" : tier === "free" ? "Free করুন" : "Premium চালু করুন"}</button></div>
    {notice && <p className={`mt-4 rounded-md px-3 py-2 text-xs font-semibold ${notice.includes("যায়নি") || notice.includes("আগে") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{notice}</p>}
  </section>;
}
