"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SpringHeading from "@/components/SpringHeading";

type Row = {
  attempt: { id: number; studentName: string; score: number; bandScore: number | null; status: string; isPublished: boolean; createdAt: string };
  examTitle: string;
  user: { id: number; email: string; nameBn: string; nameEn: string; membershipTier: string; premiumUntil: string | null } | null;
};

export default function AdminLeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const load = useCallback(() => fetch("/api/admin/leaderboard").then((response) => response.json()).then((data: Row[]) => setRows(data)).catch(() => setNotice("লিডারবোর্ড লোড করা যায়নি")).finally(() => setLoading(false)), []);
  useEffect(() => { void load(); }, [load]);
  const update = async (id: number, action: "publish" | "unpublish" | "delete") => {
    if (action === "delete" && !window.confirm("এই ফলাফলটি স্থায়ীভাবে মুছে ফেলবেন?")) return;
    setBusy(id); setNotice("");
    const response = await fetch(`/api/admin/leaderboard/${id}`, action === "delete" ? { method: "DELETE" } : { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: action === "publish" }) });
    setBusy(null);
    setNotice(response.ok ? action === "delete" ? "ফলাফল মুছে ফেলা হয়েছে।" : action === "publish" ? "ফলাফল প্রকাশ করা হয়েছে।" : "ফলাফল লুকানো হয়েছে।" : "অ্যাকশন সম্পন্ন করা যায়নি।");
    await load();
  };
  const filtered = useMemo(() => rows.filter((row) => `${row.attempt.studentName} ${row.examTitle} ${row.user?.email || ""}`.toLowerCase().includes(query.toLowerCase())), [query, rows]);

  return <div><div className="anim-fade-up flex flex-wrap items-start justify-between gap-4"><div><SpringHeading as="h1" className="text-2xl font-bold">লিডারবোর্ড কন্ট্রোল</SpringHeading><p className="mt-1 text-sm text-[#6C757D]">প্রতিটি attempt প্রকাশ, লুকানো বা মুছে ফেলুন। Premium শিক্ষার্থীকে gold badge-সহ শনাক্ত করা যায়।</p></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="নাম, টেস্ট বা ইমেইল খুঁজুন" className="w-full rounded-lg px-4 py-2.5 text-sm sm:w-72" /></div>
    {notice && <p className={`mt-4 rounded-lg px-4 py-3 text-sm font-semibold ${notice.includes("যায়নি") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{notice}</p>}
    <div className="card mt-7 overflow-x-auto rounded-xl"><table className="min-w-[820px] w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-[#6C757D]"><tr><th className="px-4 py-3">শিক্ষার্থী</th><th className="px-4 py-3">টেস্ট</th><th className="px-4 py-3 text-right">স্কোর</th><th className="px-4 py-3">স্ট্যাটাস</th><th className="px-4 py-3 text-right">কন্ট্রোল</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={5} className="px-4 py-12 text-center text-[#6C757D]">লোড হচ্ছে…</td></tr> : filtered.map((row) => { const premium = ["starter", "plus", "pro"].includes(row.user?.membershipTier || ""); return <tr key={row.attempt.id} className={premium ? "bg-amber-50/50" : ""}><td className="px-4 py-3"><p className="font-bold">{row.attempt.studentName}</p><p className="mt-0.5 text-xs text-[#6C757D]">{row.user?.email || "Guest attempt"}{premium && <span className="ml-2 rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-extrabold text-amber-950">✦ PREMIUM</span>}</p></td><td className="px-4 py-3 text-[#6C757D]">{row.examTitle}</td><td className="px-4 py-3 text-right font-bold text-[#E51A24]">{row.attempt.bandScore !== null ? `Band ${row.attempt.bandScore}` : row.attempt.score}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${row.attempt.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{row.attempt.isPublished ? "Published" : "Hidden"}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-2"><button disabled={busy === row.attempt.id} onClick={() => update(row.attempt.id, row.attempt.isPublished ? "unpublish" : "publish")} className="skeuo-key rounded-md px-3 py-1.5 text-xs font-bold disabled:opacity-60">{row.attempt.isPublished ? "Unpublish" : "Publish"}</button><button disabled={busy === row.attempt.id} onClick={() => update(row.attempt.id, "delete")} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Delete</button></div></td></tr>; })}{!loading && !filtered.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-[#6C757D]">কোনো ফলাফল পাওয়া যায়নি।</td></tr>}</tbody></table></div></div>;
}
