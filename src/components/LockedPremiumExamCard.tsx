"use client";

import Link from "next/link";
import PremiumPadlock from "@/components/PremiumPadlock";
import { useState } from "react";

type LockedPremiumExamCardProps = {
  id: number;
  category: string;
  title: string;
  description: string;
  questionValue: string;
  questionLabel: string;
  durationValue: string;
  moduleValue: string;
  moduleLabel: string;
};



export default function LockedPremiumExamCard({
  id,
  category,
  title,
  description,
  questionValue,
  questionLabel,
  durationValue,
  moduleValue,
  moduleLabel,
}: LockedPremiumExamCardProps) {
  const [isShaking, setIsShaking] = useState(false);

  function shakeLock() {
    setIsShaking(false);
    window.requestAnimationFrame(() => setIsShaking(true));
  }

  return (
    <article className="premium-locked-card card relative h-full overflow-hidden rounded-xl p-6">
      <Link href={`/exams/${id}`} className="absolute inset-0 z-10" aria-label={`${title} এর বিস্তারিত দেখুন`} />

      <div className="relative z-0 flex items-center justify-between">
        <span className="skeuo-well rounded-full px-3 py-1 text-xs font-semibold text-[#6C757D]">{category}</span>
        <div className="flex items-center gap-2">
          <span className="premium-locked-label rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em]">PREMIUM</span>
          <span className="status-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold">
            <span className="anim-pulse-live h-1.5 w-1.5 rounded-full bg-emerald-500" />
            LIVE
          </span>
        </div>
      </div>

      <h2 className="relative z-0 mt-4 text-lg font-semibold text-[#1A1A1A]">{title}</h2>
      <p className="relative z-0 mt-2 line-clamp-2 text-sm text-[#6C757D]">{description}</p>
      <div className="relative z-0 skeuo-well mt-5 grid grid-cols-3 gap-2 rounded-lg p-3 text-center text-xs">
        <div><div className="font-bold text-slate-800">{questionValue}</div><div className="text-slate-500">{questionLabel}</div></div>
        <div><div className="font-bold text-slate-800">{durationValue}</div><div className="text-slate-500">সময়</div></div>
        <div><div className="font-bold text-slate-600">{moduleValue}</div><div className="text-slate-500">{moduleLabel}</div></div>
      </div>

      <div className="premium-red-blur" aria-hidden="true" />
      <div className="premium-lock-stage">
        <button
          type="button"
          className={`premium-lock-button ${isShaking ? "is-shaking" : ""}`}
          onClick={shakeLock}
          onAnimationEnd={() => setIsShaking(false)}
          aria-label="এই Premium টেস্টটি লক করা আছে"
          title="Premium টেস্ট লক করা আছে"
        >
          <PremiumPadlock />
        </button>
        <p className="premium-lock-copy">Premium অ্যাক্সেস প্রয়োজন</p>
      </div>
    </article>
  );
}
