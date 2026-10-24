"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SpringHeading from "@/components/SpringHeading";
import Icon from "@/components/Icon";
import { SEO_PAGES, seoSettingKey } from "@/lib/seoPages";

type Field = "title" | "description" | "keywords" | "hashtags";

export default function SeoManagerPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [pageKey, setPageKey] = useState("home");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const page = useMemo(() => SEO_PAGES.find((item) => item.key === pageKey) ?? SEO_PAGES[0], [pageKey]);

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => response.json())
      .then((data: Record<string, string>) => setValues(data))
      .catch(() => setNotice("SEO সেটিংস লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, []);

  const value = (field: Field) => values[seoSettingKey(page.key, field)] ?? "";
  const setValue = (field: Field, next: string) => setValues((current) => ({ ...current, [seoSettingKey(page.key, field)]: next }));
  const save = async () => {
    setSaving(true);
    setNotice("");
    const payload: Record<string, string> = {
      [seoSettingKey(page.key, "title")]: value("title"),
      [seoSettingKey(page.key, "description")]: value("description"),
      [seoSettingKey(page.key, "keywords")]: value("keywords"),
      [seoSettingKey(page.key, "hashtags")]: value("hashtags"),
    };
    const response = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setNotice(response.ok ? "এই পেজের SEO সেটিংস সংরক্ষিত হয়েছে।" : "সংরক্ষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
  };
  const clear = () => {
    setValues((current) => ({
      ...current,
      [seoSettingKey(page.key, "title")]: "",
      [seoSettingKey(page.key, "description")]: "",
      [seoSettingKey(page.key, "keywords")]: "",
      [seoSettingKey(page.key, "hashtags")]: "",
    }));
    setNotice("খালি রাখা হয়েছে—‘সংরক্ষণ’ চাপলে এই পেজ global fallback ব্যবহার করবে।");
  };

  const input = "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";
  if (loading) return <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="shimmer h-28 rounded-xl" />)}</div>;

  return (
    <div>
      <div className="anim-fade-up flex flex-wrap items-start justify-between gap-4">
        <div>
          <SpringHeading as="h1" className="text-2xl font-bold">SEO ম্যানেজার</SpringHeading>
          <p className="mt-1 max-w-2xl text-sm text-[#6C757D]">প্রতিটি public page-এর title, meta description, keywords ও hashtags আলাদা করে নিয়ন্ত্রণ করুন। খালি রাখলে Global SEO fallback ব্যবহার হবে।</p>
        </div>
        <div className="flex gap-2">
          <Link href={page.path} target="_blank" className="skeuo-key rounded-lg px-4 py-2.5 text-sm font-bold">পেজ দেখুন ↗</Link>
          <button type="button" onClick={save} disabled={saving} className="btn-red rounded-lg px-5 py-2.5 text-sm font-bold disabled:opacity-60">{saving ? "সংরক্ষণ হচ্ছে…" : "SEO সংরক্ষণ"}</button>
        </div>
      </div>

      {notice && <p className={`anim-fade-in mt-5 rounded-lg px-4 py-3 text-sm font-semibold ${notice.includes("ব্যর্থ") || notice.includes("যায়নি") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{notice}</p>}

      <div className="mt-7 grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="card rounded-xl p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-bold tracking-wide text-[#6C757D]">PUBLIC PAGES</p>
          <div className="grid gap-1 sm:grid-cols-2 xl:block">
            {SEO_PAGES.map((item) => (
              <button key={item.key} type="button" onClick={() => { setPageKey(item.key); setNotice(""); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${page.key === item.key ? "bg-red-50 text-[#E51A24] ring-1 ring-red-100" : "text-slate-700 hover:bg-slate-50"}`}>
                <span>{item.label}</span>{item.noIndex && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">NOINDEX</span>}
              </button>
            ))}
          </div>
        </aside>

        <section className="card rounded-xl p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[.07] pb-5">
            <div><p className="text-xs font-bold tracking-wide text-[#E51A24]">{page.path}</p><SpringHeading as="h2" className="mt-1 text-xl font-bold">{page.label}</SpringHeading><p className="mt-1 text-xs text-[#6C757D]">{page.noIndex ? "এই private/account page সার্চ ইঞ্জিনে index হবে না।" : "এই পেজটি সার্চ ও social share-এ নিজের meta ব্যবহার করবে।"}</p></div>
            <button type="button" onClick={clear} className="text-xs font-bold text-[#6C757D] hover:text-[#E51A24]">পৃষ্ঠা সেটিংস খালি করুন</button>
          </div>
          <div className="mt-6 space-y-5">
            <label className="block text-sm font-bold text-slate-700">Page title <span className="font-normal text-slate-400">({value("title").length || page.fallbackTitle.length}/60 সুপারিশ)</span><input value={value("title")} onChange={(event) => setValue("title", event.target.value)} placeholder={page.fallbackTitle} className={input} /></label>
            <label className="block text-sm font-bold text-slate-700">Meta description <span className="font-normal text-slate-400">({value("description").length || page.fallbackDescription.length}/160 সুপারিশ)</span><textarea rows={4} value={value("description")} onChange={(event) => setValue("description", event.target.value)} placeholder={page.fallbackDescription} className={input} /></label>
            <label className="block text-sm font-bold text-slate-700">Keywords <span className="font-normal text-slate-400">কমা দিয়ে আলাদা করুন</span><textarea rows={2} value={value("keywords")} onChange={(event) => setValue("keywords", event.target.value)} placeholder="ielts mock test, IELTS Bangladesh, reading practice" className={input} /></label>
            <label className="block text-sm font-bold text-slate-700">Hashtags <span className="font-normal text-slate-400">কমা দিয়ে আলাদা করুন</span><input value={value("hashtags")} onChange={(event) => setValue("hashtags", event.target.value)} placeholder="#IELTS, #MockTest, #IELTSBangladesh" className={input} /></label>
          </div>
          <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Icon name="globe" size={14} /> SEARCH PREVIEW</div><p className="mt-3 text-lg font-semibold text-[#1a0dab]">{value("title") || page.fallbackTitle}</p><p className="mt-1 text-xs text-emerald-700">{page.path}</p><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{value("description") || page.fallbackDescription}</p></div>
        </section>
      </div>
    </div>
  );
}
