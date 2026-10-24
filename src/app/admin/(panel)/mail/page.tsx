"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import SpringHeading from "@/components/SpringHeading";
import Icon from "@/components/Icon";

type Template = { key: string; label: string; description: string; subject: string; eyebrow: string; title: string; body: string; ctaLabel: string; isCustom: boolean };
type Layout = { logoUrl: string; accentColor: string; buttonColor: string; headerTitle: string; headerTagline: string; footerText: string };
const PLACEHOLDERS = ["{{student_name}}", "{{exam_title}}", "{{result}}", "{{product}}", "{{total}}", "{{expiry_label}}", "{{otp_code}}", "{{site_name}}"];
const SAMPLE: Record<string, string> = { "{{student_name}}": "Demo Student", "{{exam_title}}": "IELTS Reading Practice Test", "{{result}}": "Band 7.0", "{{product}}": "Premium Plus", "{{total}}": "1,000 BDT", "{{expiry_label}}": "30 দিন", "{{otp_code}}": "123456", "{{site_name}}": "IELTS Mock Test" };

const inputClass = "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";

function previewText(value: string) {
  return Object.entries(SAMPLE).reduce((text, [key, sample]) => text.replaceAll(key, sample), value);
}

export default function AdminMailPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [draft, setDraft] = useState<Template | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [testTo, setTestTo] = useState("");
  const [showHtml, setShowHtml] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorBodyRef = useRef("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [editorRevision, setEditorRevision] = useState(0);

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/mail-templates");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setNotice(data.error || "Email templates লোড করা যায়নি"); setLoading(false); return; }
    const next = data.templates as Template[];
    setTemplates(next);
    setLayout(data.layout as Layout);
    const key = selectedKey && next.some((item) => item.key === selectedKey) ? selectedKey : next[0]?.key;
    const nextDraft = next.find((item) => item.key === key) || null;
    setSelectedKey(key || "");
    setDraft(nextDraft);
    editorBodyRef.current = nextDraft?.body || "";
    setEditorRevision((value) => value + 1);
    setLoading(false);
  };

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (editorRef.current) editorRef.current.innerHTML = editorBodyRef.current; }, [editorRevision]);

  const selectTemplate = (item: Template) => {
    setSelectedKey(item.key);
    setDraft({ ...item });
    editorBodyRef.current = item.body;
    setEditorRevision((value) => value + 1);
    setShowHtml(false);
    setNotice("");
  };

  const syncEditor = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    editorBodyRef.current = html;
    setDraft((current) => current ? { ...current, body: html } : current);
  };

  const command = (name: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    syncEditor();
  };

  const insertImage = (url: string) => {
    const clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) return setNotice("ছবির একটি সম্পূর্ণ https:// URL দিন অথবা ছবি আপলোড করুন।");
    command("insertImage", clean);
    setImageUrl("");
  };

  const uploadImage = async (file: File, target: "logo" | "body") => {
    if (!file.type.startsWith("image/")) return setNotice("শুধু image file আপলোড করুন।");
    const form = new FormData(); form.append("file", file);
    setNotice("ছবি আপলোড হচ্ছে…");
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setNotice(data.error || "ছবি আপলোড করা যায়নি");
    const url = `${window.location.origin}${data.url}`;
    if (target === "logo") setLayout((current) => current ? { ...current, logoUrl: url } : current);
    else insertImage(url);
    setNotice(target === "logo" ? "Logo upload হয়েছে। Layout সংরক্ষণ করুন।" : "ছবি email content-এ যুক্ত হয়েছে। Template সংরক্ষণ করুন।");
  };

  const saveTemplate = async () => {
    if (!draft) return;
    syncEditor();
    const body = editorRef.current?.innerHTML ?? draft.body;
    setSaving(true);
    const response = await fetch("/api/admin/mail-templates", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: draft.key, template: { ...draft, body } }) });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) return setNotice(data.error || "Template সংরক্ষণ করা যায়নি");
    setNotice(`${draft.label} template সংরক্ষিত হয়েছে। পরবর্তী email-এ এটি ব্যবহৃত হবে।`);
    await load();
  };

  const saveLayout = async () => {
    if (!layout) return;
    setSaving(true);
    const response = await fetch("/api/admin/mail-templates", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "layout", layout }) });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) return setNotice(data.error || "Email layout সংরক্ষণ করা যায়নি");
    setNotice("Global email branding/layout সংরক্ষিত হয়েছে।");
    await load();
  };

  const restoreTemplate = async () => {
    if (!draft || !confirm("এই email template-এর সব custom পরিবর্তন মুছে default-এ ফিরিয়ে আনবেন?")) return;
    const response = await fetch("/api/admin/mail-templates", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: draft.key }) });
    if (!response.ok) return setNotice("Default template ফিরিয়ে আনা যায়নি");
    setNotice("Default template পুনরুদ্ধার হয়েছে।");
    await load();
  };

  const restoreLayout = async () => {
    if (!confirm("Logo ও global email branding default-এ ফিরিয়ে আনবেন?")) return;
    const response = await fetch("/api/admin/mail-templates", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "layout" }) });
    if (!response.ok) return setNotice("Default layout ফিরিয়ে আনা যায়নি");
    setNotice("Default email layout পুনরুদ্ধার হয়েছে।");
    await load();
  };

  const toggleHtml = () => {
    if (showHtml) {
      editorBodyRef.current = draft?.body || "";
      setEditorRevision((value) => value + 1);
    }
    setShowHtml((value) => !value);
  };

  const sendTest = async () => {
    if (!draft || !testTo.trim()) return setNotice("Test email পাওয়ার জন্য একটি recipient email দিন।");
    setSaving(true);
    const response = await fetch("/api/admin/mail-templates/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: draft.key, to: testTo.trim() }) });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    setNotice(response.ok ? "Test email পাঠানো হয়েছে। Inbox, Spam ও Promotions দেখুন।" : data.error || "Test email পাঠানো যায়নি");
  };

  if (loading || !draft || !layout) return <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="card shimmer h-28 rounded-xl" />)}</div>;

  return <div>
    <div className="anim-fade-up flex flex-wrap items-start justify-between gap-4">
      <div><SpringHeading as="h1" className="text-2xl font-bold">Mail Studio</SpringHeading><p className="mt-1 max-w-2xl text-sm text-[#6C757D]">সব automated email-এর লেখা, rich formatting, button, color এবং logo এক জায়গা থেকে পরিবর্তন করুন। পরিবর্তন save হওয়ার পরের email থেকেই কার্যকর হবে।</p></div>
      <a href="/admin/media" className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">মিডিয়া ভল্ট খুলুন</a>
    </div>

    {notice && <p className={`mt-4 rounded-lg px-4 py-3 text-sm font-semibold ${notice.includes("যায়নি") || notice.includes("দিন") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}>{notice}</p>}

    <section className="card mt-7 rounded-xl p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><SpringHeading as="h2" className="text-lg font-bold">Global email branding</SpringHeading><p className="mt-1 text-xs text-[#6C757D]">প্রতিটি automated email-এর header, logo, button color এবং footer।</p></div><div className="flex gap-2"><button onClick={restoreLayout} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold">Default</button><button disabled={saving} onClick={saveLayout} className="btn-red rounded-md px-4 py-2 text-xs font-bold disabled:opacity-60">Layout সংরক্ষণ করুন</button></div></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div><label className="text-sm font-medium">Logo image URL</label><input value={layout.logoUrl} onChange={(event) => setLayout({ ...layout, logoUrl: event.target.value })} placeholder="https://your-domain.com/logo.png" className={inputClass}/><p className="mt-1 text-xs text-slate-500">অথবা এখান থেকে image upload করুন। Email client-এ দেখানোর জন্য public image URL ব্যবহৃত হবে।</p><button onClick={() => logoInputRef.current?.click()} className="mt-2 rounded border border-slate-300 px-3 py-2 text-xs font-bold">Logo upload করুন</button><input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, "logo"); event.target.value = ""; }}/></div>
        <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Accent color<input type="color" value={layout.accentColor} onChange={(event) => setLayout({ ...layout, accentColor: event.target.value })} className="mt-2 block h-11 w-full rounded border border-slate-300 bg-white p-1"/></label><label className="text-sm font-medium">Button color<input type="color" value={layout.buttonColor} onChange={(event) => setLayout({ ...layout, buttonColor: event.target.value })} className="mt-2 block h-11 w-full rounded border border-slate-300 bg-white p-1"/></label></div>
        <label className="text-sm font-medium">Header title<input value={layout.headerTitle} onChange={(event) => setLayout({ ...layout, headerTitle: event.target.value })} className={inputClass}/></label>
        <label className="text-sm font-medium">Header tagline<input value={layout.headerTagline} onChange={(event) => setLayout({ ...layout, headerTagline: event.target.value })} className={inputClass}/></label>
        <label className="text-sm font-medium lg:col-span-2">Footer text<textarea rows={2} value={layout.footerText} onChange={(event) => setLayout({ ...layout, footerText: event.target.value })} className={inputClass}/></label>
      </div>
      {layout.logoUrl && <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><img src={layout.logoUrl} alt="Current email logo" className="h-10 w-10 rounded object-contain"/> বর্তমান logo preview</div>}
    </section>

    <div className="mt-7 grid gap-6 xl:grid-cols-[245px_minmax(0,1fr)]">
      <aside className="card h-fit rounded-xl p-3"><p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Automated emails</p>{templates.map((item) => <button key={item.key} onClick={() => selectTemplate(item)} className={`mb-1 w-full rounded-lg px-3 py-3 text-left transition ${selectedKey === item.key ? "bg-red-50 text-[#E51A24] ring-1 ring-red-100" : "hover:bg-slate-50"}`}><span className="block text-sm font-bold">{item.label}</span><span className="mt-0.5 block text-xs text-slate-500">{item.isCustom ? "Custom template" : "Default template"}</span></button>)}</aside>

      <section className="card min-w-0 rounded-xl p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><SpringHeading as="h2" className="text-xl font-bold">{draft.label}</SpringHeading><p className="mt-1 text-sm text-slate-500">{draft.description}</p></div><div className="flex gap-2"><button onClick={restoreTemplate} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold">Default ফিরান</button><button disabled={saving} onClick={saveTemplate} className="btn-red rounded-md px-4 py-2 text-xs font-bold disabled:opacity-60">{saving ? "সংরক্ষণ হচ্ছে…" : "Template সংরক্ষণ করুন"}</button></div></div>

        <div className="mt-6 grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Email subject<input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} className={inputClass}/></label><label className="text-sm font-medium">Top label / eyebrow<input value={draft.eyebrow} onChange={(event) => setDraft({ ...draft, eyebrow: event.target.value })} className={inputClass}/></label><label className="text-sm font-medium md:col-span-2">Email title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={inputClass}/></label><label className="text-sm font-medium md:col-span-2">Button text <span className="font-normal text-slate-500">(blank রাখলে button থাকবে না)</span><input value={draft.ctaLabel} onChange={(event) => setDraft({ ...draft, ctaLabel: event.target.value })} className={inputClass}/></label></div>

        <div className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3"><label className="text-sm font-medium">Email content</label><button onClick={toggleHtml} className="text-xs font-bold text-[#E51A24]">{showHtml ? "Rich editor দেখান" : "HTML source edit"}</button></div>
          {!showHtml && <><div className="mt-2 flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-slate-300 bg-slate-50 p-2"><button type="button" title="Bold" onMouseDown={(event) => { event.preventDefault(); command("bold"); }} className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-[#E51A24]">B</button><button type="button" title="Italic" onMouseDown={(event) => { event.preventDefault(); command("italic"); }} className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-[#E51A24]">I</button><button type="button" title="Text color" onMouseDown={(event) => { event.preventDefault(); command("foreColor", "#E51A24"); }} className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-[#E51A24]">A</button><button type="button" title="Yellow highlight" onMouseDown={(event) => { event.preventDefault(); command("hiliteColor", "#fff3a3"); }} className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-[#E51A24]">Highlight</button><label className="flex items-center rounded border border-slate-200 bg-white px-2 text-xs font-bold">Text<input type="color" onChange={(event) => command("foreColor", event.target.value)} className="ml-1 h-6 w-7 border-0 bg-transparent p-0"/></label><label className="flex items-center rounded border border-slate-200 bg-white px-2 text-xs font-bold">Highlight<input type="color" onChange={(event) => command("hiliteColor", event.target.value)} className="ml-1 h-6 w-7 border-0 bg-transparent p-0"/></label><select defaultValue="" onChange={(event) => { if (event.target.value) command("fontSize", event.target.value); event.target.value = ""; }} className="rounded border border-slate-200 bg-white px-2 text-xs font-bold"><option value="">Font size</option><option value="2">Small</option><option value="3">Normal</option><option value="4">Large</option><option value="5">XL</option><option value="6">XXL</option></select><button type="button" title="Clear selected formatting" onMouseDown={(event) => { event.preventDefault(); command("removeFormat"); }} className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-[#E51A24]">Clear</button></div><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={syncEditor} className="min-h-64 rounded-b-lg border border-slate-300 bg-white p-4 text-[15px] leading-7 outline-none focus:border-[#E51A24] focus:ring-2 focus:ring-red-100"/></>}
          {showHtml && <textarea rows={14} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} className={`${inputClass} font-mono text-xs`}/>}
          <div className="mt-3 flex flex-wrap items-center gap-2"><input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://... image URL" className="w-full rounded border border-slate-300 px-3 py-2 text-xs sm:w-64"/><button type="button" onMouseDown={(event) => { event.preventDefault(); insertImage(imageUrl); }} className="rounded border border-slate-300 px-3 py-2 text-xs font-bold">Image URL যোগ করুন</button><button type="button" onMouseDown={(event) => { event.preventDefault(); bodyImageInputRef.current?.click(); }} className="rounded border border-slate-300 px-3 py-2 text-xs font-bold">ছবি upload করে যোগ করুন</button><input ref={bodyImageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, "body"); event.target.value = ""; }}/></div>
          <div className="mt-3 flex flex-wrap gap-2"><span className="py-1 text-xs text-slate-500">Dynamic text:</span>{PLACEHOLDERS.map((placeholder) => <button key={placeholder} type="button" onMouseDown={(event) => { event.preventDefault(); command("insertText", placeholder); }} className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700 hover:bg-red-50">{placeholder}</button>)}</div>
        </div>

        <div className="mt-7 border-t border-slate-200 pt-6"><SpringHeading as="h3" className="text-base font-bold">Live content preview</SpringHeading><div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-6"><div className="mx-auto max-w-[620px] overflow-hidden rounded-xl bg-white shadow-sm"><div className="flex items-center gap-3 bg-slate-900 p-5 text-white">{layout.logoUrl ? <img src={layout.logoUrl} alt="" className="h-10 w-10 rounded bg-white object-contain"/> : <div className="grid h-10 w-10 place-items-center rounded text-xs font-bold text-white" style={{ backgroundColor: layout.accentColor }}>IELTS</div>}<div><b>{previewText(layout.headerTitle)}</b><div className="mt-0.5 text-[10px] tracking-wider text-slate-300">{previewText(layout.headerTagline)}</div></div></div><div className="p-6"><div className="text-[11px] font-extrabold tracking-widest" style={{ color: layout.accentColor }}>{previewText(draft.eyebrow)}</div><h4 className="mt-2 text-xl font-bold text-slate-900">{previewText(draft.title)}</h4><div className="mt-3 text-sm leading-7 text-slate-600" dangerouslySetInnerHTML={{ __html: previewText(draft.body) }}/>{draft.ctaLabel && <button className="mt-5 rounded px-4 py-3 text-sm font-bold text-white" style={{ backgroundColor: layout.buttonColor }}>{previewText(draft.ctaLabel)}</button>}</div><div className="border-t p-5 text-[11px] text-slate-400">{previewText(layout.footerText)}</div></div></div></div>

        <div className="mt-7 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><div className="min-w-56 flex-1"><label className="text-sm font-bold">Test recipient</label><input type="email" value={testTo} onChange={(event) => setTestTo(event.target.value)} placeholder="you@example.com" className={inputClass}/></div><button disabled={saving} onClick={sendTest} className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">Test email পাঠান</button></div>
      </section>
    </div>
  </div>;
}
