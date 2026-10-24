"use client";

import { useCallback, useEffect, useState } from "react";
import SpringHeading from "@/components/SpringHeading";
import PremiumSettingsPanel from "@/components/PremiumSettingsPanel";
import ManualMembershipPanel from "@/components/ManualMembershipPanel";

type Row = {
  payment: { id: number; tier: string; paymentMethod: string; transactionId: string; senderNumber: string; status: string; adminNote: string; receiptCode: string; createdAt: string };
  user: { id: number; nameBn: string; nameEn: string; email: string; phone: string };
};
type EmailStatus = { configured: boolean; hasUser: boolean; hasPassword: boolean; sender: string; provider: string };

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [notice, setNotice] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/payments");
      const data = await response.json().catch(() => ({}));
      const paymentRows = Array.isArray(data) ? data : data.rows;
      if (!response.ok || !Array.isArray(paymentRows)) throw new Error(data.error || "পেমেন্ট ইনবক্স লোড করা যায়নি");
      setRows(paymentRows);
      setNotes(Object.fromEntries(paymentRows.map((row: Row) => [row.payment.id, row.payment.adminNote])));
      if (data.warning) setNotice(data.warning);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "পেমেন্ট ইনবক্স লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    fetch("/api/admin/email-status").then((response) => response.ok ? response.json() : null).then((data) => setEmailStatus(data)).catch(() => {});
  }, []);

  const update = async (id: number, status: "approved" | "rejected") => {
    setBusy(id); setNotice("");
    const response = await fetch(`/api/admin/payments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, adminNote: notes[id] ?? "" }) });
    const data = await response.json().catch(() => ({}));
    setBusy(null);
    setNotice(response.ok ? status === "approved" ? data.warning ? `Premium অনুমোদিত হয়েছে। ${data.warning}` : "Premium অনুমোদন, receipt ও email workflow সম্পন্ন হয়েছে।" : "রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে।" : data.error || "পেমেন্ট আপডেট করা যায়নি।");
    if (response.ok) await load();
  };

  return <div><div className="anim-fade-up"><SpringHeading as="h1" className="text-2xl font-bold">Premium ও পেমেন্ট</SpringHeading><p className="mt-1 text-sm text-[#6C757D]">টায়ার, বাংলাদেশি Send Money নম্বর, manual membership এবং payment receipt এক জায়গা থেকে নিয়ন্ত্রণ করুন।</p></div>
    {emailStatus && !emailStatus.configured && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Gmail SMTP email এখন প্রস্তুত নয়।</b> {!emailStatus.hasUser ? "Vercel Environment Variables-এ EMAIL_USER যোগ করুন।" : "Vercel Environment Variables-এ Gmail App Password দিয়ে EMAIL_PASS যোগ করুন।"} App Password ব্যবহার করুন—মূল Gmail password নয়।</div>}
    {emailStatus?.configured && <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">Gmail SMTP configured · sender: {emailStatus.sender}</p>}
    {notice && <p className={`mt-4 rounded-lg px-4 py-3 text-sm font-semibold ${notice.includes("যায়নি") || notice.includes("ব্যর্থ") || notice.includes("প্রস্তুত") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{notice}</p>}
    <PremiumSettingsPanel />
    <ManualMembershipPanel onUpdated={() => { void load(); }} />
    <section data-tour="admin-payment-inbox" className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><SpringHeading as="h2" className="text-lg font-bold">পেমেন্ট রিকোয়েস্ট ইনবক্স</SpringHeading><p className="mt-1 text-xs text-[#6C757D]">Approve করলে membership চালু, receipt code/token তৈরি এবং product-price email পাঠানোর চেষ্টা হবে।</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{rows.filter((row) => row.payment.status === "pending").length} অপেক্ষমাণ</span></div>
      {loading ? <div className="mt-5 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="shimmer h-28 rounded-lg" />)}</div> : <div className="mt-5 space-y-4">{rows.map(({ payment, user }) => <article key={payment.id} className="card rounded-xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{user.nameBn || user.nameEn || user.email}</p><p className="mt-1 text-xs text-[#6C757D]">{user.email} {user.phone ? `· ${user.phone}` : ""}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${payment.status === "approved" ? "bg-emerald-50 text-emerald-700" : payment.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{payment.status === "approved" ? "অনুমোদিত" : payment.status === "rejected" ? "প্রত্যাখ্যাত" : "অপেক্ষমাণ"}</span></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><p><b>Tier:</b> {payment.tier}</p><p><b>Method:</b> {payment.paymentMethod}</p><p><b>Txn ID:</b> {payment.transactionId}</p><p><b>Sender:</b> {payment.senderNumber || "—"}</p></div>{payment.receiptCode && <a href={`/api/payments/${payment.id}/receipt`} className="mt-3 inline-flex rounded-md bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100">Receipt PDF · {payment.receiptCode}</a>}<div className="mt-4 flex flex-wrap gap-2"><input value={notes[payment.id] ?? ""} onChange={(event) => setNotes((value) => ({ ...value, [payment.id]: event.target.value }))} placeholder="অ্যাডমিন নোট (ঐচ্ছিক)" className="min-w-[220px] flex-1 rounded-md px-3 py-2 text-sm"/><button disabled={busy === payment.id} onClick={() => update(payment.id, "approved")} className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">অনুমোদন</button><button disabled={busy === payment.id} onClick={() => update(payment.id, "rejected")} className="rounded-md bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">প্রত্যাখ্যান</button></div></article>)}{rows.length === 0 && <p className="card rounded-lg p-10 text-center text-sm text-[#6C757D]">এখনও কোনো পেমেন্ট রিকোয়েস্ট নেই।</p>}</div>}
    </section></div>;
}
