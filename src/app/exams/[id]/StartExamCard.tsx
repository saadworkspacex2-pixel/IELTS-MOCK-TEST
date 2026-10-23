"use client";

import SpringHeading from "@/components/SpringHeading";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toBn } from "@/components/CountUp";

export default function StartExamCard({
  examId,
  hasQuestions,
  durationMinutes,
}: {
  examId: number;
  hasQuestions: boolean;
  durationMinutes: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setName(d.user.nameBn || d.user.nameEn || "");
      })
      .catch(() => {});
  }, []);
  const [error, setError] = useState("");

  const start = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("আপনার নাম লিখুন");
      return;
    }
    sessionStorage.setItem("mt_student_name", trimmed);
    sessionStorage.setItem("mt_exam_fullscreen_requested", "1");
    // Fullscreen must be requested directly from this user click; browsers may still let candidates decline it.
    document.documentElement.requestFullscreen?.().catch(() => {});
    router.push(`/exams/${examId}/take`);
  };

  return (
    <div data-tour="exam-start-card" className="skeuo-paper sticky top-24 overflow-hidden rounded-xl p-7">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C757D]">
        Candidate Entry Slip
      </p>
      <SpringHeading as="h2" className="mt-1 text-lg font-bold">
        পরীক্ষা শুরু করুন
      </SpringHeading>
      <p className="mt-2 text-sm text-[#6C757D]">
        নাম লিখুন — রেজিস্ট্রেশন লাগবে না। টাইমার চলবে{" "}
        {toBn(durationMinutes)} মিনিট।
      </p>
      <label className="mt-5 block text-sm font-semibold text-[#212529]">
        আপনার নাম
      </label>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && start()}
        placeholder="যেমন: রাহিম উদ্দিন"
        className="mt-2 w-full rounded-lg px-4 py-3 text-sm outline-none"
      />
      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
      <button
        type="button"
        onClick={start}
        disabled={!hasQuestions}
        className="btn-red mt-5 w-full rounded-lg py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-40"
      >
        {hasQuestions ? "এখনই শুরু করুন" : "প্রশ্ন যোগ করা হয়নি"}
      </button>
      <p className="mt-4 text-center text-xs font-medium text-[#6C757D]">
        শুরু করলেই টাইমার চালু হয়ে যাবে
      </p>
    </div>
  );
}
