"use client";

import { useEffect, useState } from "react";
import SpringHeading from "@/components/SpringHeading";
import PremiumSettingsPanel from "@/components/PremiumSettingsPanel";

type Row = {
  payment: { id: number; tier: string; paymentMethod: string; transactionId: string; senderNumber: string; status: string; adminNote: string; createdAt: string };
  user: { id: number; nameBn: string; nameEn: string; email: string; phone: string };
};

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const load = () => fetch("/api/admin/payments").then((r) => r.json()).then((data: Row[]) => { setRows(data); setNotes(Object.fromEntries(data.map((row) => [row.payment.id, row.payment.adminNote]))); }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const update = async (id: number, status: "approved" | "rejected") => { setBusy(id); await fetch(`/api/admin/payments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, adminNote: notes[id] ?? "" }) }); await load(); setBusy(null); };
  return <div><div className="anim-fade-up"><SpringHeading as="h1" className="text-2xl font-bold">Premium ও পেমেন্ট</SpringHeading><p className="mt-1 text-sm text-[#6C757D]">টায়ার, বাংলাদেশি Send Money নম্বর এবং পেমেন্ট রিকোয়েস্ট এক জায়গা থেকে নিয়ন্ত্রণ করুন।</p></div><PremiumSettingsPanel /><section data-tour="admin-payment-inbox" className="mt-8"><div className="flex items-center justify-between"><SpringHeading as="h2" className="text-lg font-bold">পেমেন্ট রিকোয়েস্ট ইনবক্স</SpringHeading><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{rows.filter((row) => row.payment.status === "pending").length} অপেক্ষমাণ</span></div>{loading ? <div className="mt-5 space-y-3">{[1,2,3].map((n) => <div key={n} className="shimmer h-28 rounded-lg" />)}</div> : <div className="mt-5 space-y-4">{rows.map(({ payment, user }) => <article key={payment.id} className="card rounded-lg p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{user.nameBn || user.nameEn || user.email}</p><p className="mt-1 text-xs text-[#6C757D]">{user.email} {user.phone ? `· ${user.phone}` : ""}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${payment.status === "approved" ? "bg-emerald-50 text-emerald-700" : payment.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{payment.status === "approved" ? "অনুমোদিত" : payment.status === "rejected" ? "প্রত্যাখ্যাত" : "অপেক্ষমাণ"}</span></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-4"><p><b>Tier:</b> {payment.tier}</p><p><b>Method:</b> {payment.paymentMethod}</p><p><b>Txn ID:</b> {payment.transactionId}</p><p><b>Sender:</b> {payment.senderNumber || "—"}</p></div><div className="mt-4 flex flex-wrap gap-2"><input value={notes[payment.id] ?? ""} onChange={(e) => setNotes((value) => ({ ...value, [payment.id]: e.target.value }))} placeholder="অ্যাডমিন নোট (ঐচ্ছিক)" className="min-w-[220px] flex-1 rounded-md px-3 py-2 text-sm"/><button disabled={busy === payment.id} onClick={() => update(payment.id, "approved")} className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">অনুমোদন</button><button disabled={busy === payment.id} onClick={() => update(payment.id, "rejected")} className="rounded-md bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">প্রত্যাখ্যান</button></div></article>)}{rows.length === 0 && <p className="card rounded-lg p-10 text-center text-sm text-[#6C757D]">এখনও কোনো পেমেন্ট রিকোয়েস্ট নেই।</p>}</div>}</section></div>;
}
