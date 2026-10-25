"use client";

import Icon from "@/components/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type ProfileFields = {
  nameBn: string;
  nameEn: string;
  phone: string;
  avatar: string;
  email: string;
};

type ProfileEditFormProps = {
  user: ProfileFields;
};

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] outline-none transition placeholder:text-slate-400 focus:border-[#E51A24] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100";

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("ছবিটি পড়া যায়নি"));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("ছবির ফরম্যাটটি সমর্থিত নয়"));
    image.src = source;
  });
}

async function optimiseAvatar(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("শুধু ছবি ফাইল নির্বাচন করুন");
  }
  if (file.size > 8_000_000) {
    throw new Error("ছবি সর্বোচ্চ ৮ মেগাবাইট হতে পারবে");
  }

  const source = await readFile(file);
  const image = await loadImage(source);
  const maxSize = 640;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("ছবিটি প্রস্তুত করা যায়নি");

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let result = canvas.toDataURL("image/webp", 0.84);
  if (result.length > 1_400_000) {
    const compactCanvas = document.createElement("canvas");
    compactCanvas.width = Math.max(1, Math.round(canvas.width * 0.75));
    compactCanvas.height = Math.max(1, Math.round(canvas.height * 0.75));
    const compactContext = compactCanvas.getContext("2d");
    if (!compactContext) throw new Error("ছবিটি প্রস্তুত করা যায়নি");
    compactContext.drawImage(canvas, 0, 0, compactCanvas.width, compactCanvas.height);
    result = compactCanvas.toDataURL("image/jpeg", 0.78);
  }
  if (result.length > 1_500_000) {
    throw new Error("ছবিটি ছোট করে আপলোড করুন");
  }
  return result;
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileFields>(user);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [preparingImage, setPreparingImage] = useState(false);

  const chooseAvatar = async (file: File) => {
    setPreparingImage(true);
    setError("");
    try {
      const avatar = await optimiseAvatar(file);
      setForm((current) => ({ ...current, avatar }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ছবিটি প্রস্তুত করা যায়নি");
    } finally {
      setPreparingImage(false);
    }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameBn: form.nameBn,
          nameEn: form.nameEn,
          phone: form.phone,
          avatar: form.avatar,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "প্রোফাইল সংরক্ষণ করা যায়নি");
      router.replace("/profile");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "প্রোফাইল সংরক্ষণ করা যায়নি");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="card rounded-2xl p-5 sm:p-8">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={preparingImage || saving}
          className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-white text-slate-500 transition hover:border-[#E51A24] disabled:opacity-60"
          aria-label="প্রোফাইল ছবি পরিবর্তন করুন"
        >
          {form.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.avatar} alt="নির্বাচিত প্রোফাইল ছবি" className="h-full w-full object-cover" />
          ) : (
            <Icon name="users" size={30} />
          )}
          <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#E51A24] text-white shadow">
            <Icon name="edit" size={14} />
          </span>
        </button>
        <div className="min-w-[190px] flex-1">
          <p className="font-bold text-[#1A1A1A]">প্রোফাইল ছবি</p>
          <p className="mt-1 text-xs leading-5 text-[#6C757D]">JPG, PNG অথবা WebP নির্বাচন করুন। ছবিটি স্বয়ংক্রিয়ভাবে ছোট করে সংরক্ষণ করা হবে।</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={preparingImage || saving} className="text-xs font-bold text-[#B50C16] hover:underline disabled:opacity-50">
              {preparingImage ? "ছবি প্রস্তুত হচ্ছে…" : "ছবি পরিবর্তন করুন"}
            </button>
            {form.avatar && <button type="button" onClick={() => setForm((current) => ({ ...current, avatar: "" }))} disabled={saving} className="text-xs font-bold text-rose-600 hover:underline disabled:opacity-50">ছবি সরান</button>}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void chooseAvatar(file);
            event.target.value = "";
          }}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">
          নাম (বাংলা)
          <input value={form.nameBn} onChange={(event) => setForm((current) => ({ ...current, nameBn: event.target.value }))} placeholder="রাহিম উদ্দিন" maxLength={120} className={inputClass} />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Name (English)
          <input value={form.nameEn} onChange={(event) => setForm((current) => ({ ...current, nameEn: event.target.value }))} placeholder="Rahim Uddin" maxLength={120} className={inputClass} />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">
          মোবাইল নম্বর
          <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} inputMode="tel" placeholder="01XXXXXXXXX" maxLength={32} className={inputClass} />
        </label>
        <label className="text-sm font-bold text-slate-700">
          ইমেইল
          <input value={form.email} readOnly aria-readonly="true" className={`${inputClass} text-slate-500`} />
          <span className="mt-1 block text-[11px] font-medium text-slate-500">লগইন নিরাপত্তার জন্য ইমেইল পরিবর্তন করা যায় না।</span>
        </label>
      </div>

      {error && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
        <Link href="/profile" className="rounded-md px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">বাতিল</Link>
        <button type="submit" disabled={saving || preparingImage} className="btn-red inline-flex min-w-36 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold disabled:opacity-60">
          <Icon name="check" size={16} /> {saving ? "সংরক্ষণ হচ্ছে…" : "তথ্য সংরক্ষণ করুন"}
        </button>
      </div>
    </form>
  );
}
