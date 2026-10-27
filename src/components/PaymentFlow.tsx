"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PremiumTier } from "@/lib/premium";

type Wallet = {
  key: "bkash" | "nagad" | "rocket" | "upay";
  label: string;
  number: string;
  logo: string;
};

export default function PaymentFlow({
  tier,
  loggedIn,
  wallets,
  instruction,
}: {
  tier: PremiumTier;
  loggedIn: boolean;
  wallets: Wallet[];
  instruction?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Wallet | null>(wallets.find((w) => w.number) ?? null);
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const copyNumber = async () => {
    if (!selected?.number) return;
    await navigator.clipboard?.writeText(selected.number);
    setNotice(`${selected.label} নম্বর কপি হয়েছে। অ্যাপ থেকে Send Money করে Txn ID দিন।`);
  };

  const submit = async () => {
    if (!selected?.number) return setNotice("এই পেমেন্ট পদ্ধতির নম্বর এখনও অ্যাডমিন সেট করেননি।");
    if (!transactionId.trim()) return setNotice("Send Money করার পর Transaction ID লিখুন।");
    setSaving(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, paymentMethod: selected.key, transactionId, senderNumber }),
    });
    setSaving(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setNotice(data.error || "রিকোয়েস্ট পাঠানো যায়নি।");
    router.push(`/thank-you?payment=${data.id}`);
  };

  if (!loggedIn) {
    return <Link href="/login" className="btn-red mt-6 block rounded-md px-5 py-3 text-center text-sm font-bold">লগইন করে পেমেন্ট করুন</Link>;
  }

  return (
    <div data-tour="bd-send-money" className="mt-6 border-t border-black/10 pt-5">
      <p className="text-xs font-bold text-[#6C757D]">১. একটি বাংলাদেশি মোবাইল ফাইন্যান্সিয়াল সার্ভিস বেছে নিন</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {wallets.map((wallet) => (
          <button
            key={wallet.key}
            type="button"
            onClick={() => { setSelected(wallet); setNotice(""); }}
            className={`flex min-h-16 flex-col items-center justify-center rounded-md border px-2 py-2 text-xs font-bold transition ${selected?.key === wallet.key ? "border-[#E51A24] bg-red-50 text-[#E51A24]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}
            aria-label={`${wallet.label} পেমেন্ট পদ্ধতি`}
          >
            {/* Official provider mark. Brand names remain as accessible text. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wallet.logo} alt="" className={`mb-1 h-7 max-w-20 object-contain ${wallet.key === "upay" ? "w-7" : "w-full"}`} />
            <span>{wallet.label}</span>
          </button>
        ))}
      </div>
      {selected?.number ? (
        <>
          <button type="button" onClick={copyNumber} className="skeuo-key mt-3 flex w-full items-center justify-between rounded-md px-4 py-3 text-left text-sm">
            <span><b>{selected.label} Send Money</b><br /><span className="text-xs text-[#6C757D]">{selected.number}</span></span>
            <span className="text-xs font-bold text-[#E51A24]">এক ট্যাপে কপি</span>
          </button>
          <p className="mt-2 text-[11px] leading-relaxed text-[#6C757D]">পেমেন্ট অ্যাপ নিজে খুলতে বা টাকা পাঠাতে সেবাদাতার অনুমোদিত merchant integration দরকার। এই এক-ট্যাপ বাটনটি প্রাপকের নম্বর কপি করে; এরপর আপনার পেমেন্ট অ্যাপ থেকে Send Money করুন।</p>
          {instruction && <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-[#6C757D]">{instruction}</p>}
          <label className="mt-4 block text-xs font-bold text-[#6C757D]">২. Transaction ID *</label>
          <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="যেমন: 8N7A2BC9D" className="mt-1.5 w-full rounded-md px-3 py-2.5 text-sm" />
          <label className="mt-3 block text-xs font-bold text-[#6C757D]">প্রেরকের মোবাইল নম্বর (ঐচ্ছিক)</label>
          <input value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" className="mt-1.5 w-full rounded-md px-3 py-2.5 text-sm" />
          {notice && <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">{notice}</p>}
          <button type="button" disabled={saving} onClick={submit} className="btn-red mt-4 w-full rounded-md px-5 py-3 text-sm font-bold disabled:opacity-60">{saving ? "পাঠানো হচ্ছে…" : "পেমেন্ট রিকোয়েস্ট পাঠান"}</button>
        </>
      ) : <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-[#6C757D]">পেমেন্ট নম্বর এখনও সেট করা হয়নি। অ্যাডমিন &gt; সেটিংস থেকে bKash/Nagad/Rocket নম্বর যোগ করুন।</p>}
    </div>
  );
}
