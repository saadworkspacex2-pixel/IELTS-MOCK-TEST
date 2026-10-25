"use client";

import Link from "next/link";
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

function PadlockMark() {
  return (
    <svg viewBox="0 0 112 128" aria-hidden="true" className="premium-lock-icon">
      <defs>
        <linearGradient id="lockBody" x1="18" y1="42" x2="97" y2="117" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7f7" />
          <stop offset="0.18" stopColor="#f36b70" />
          <stop offset="0.52" stopColor="#c41421" />
          <stop offset="0.78" stopColor="#8e0712" />
          <stop offset="1" stopColor="#53020a" />
        </linearGradient>
        <linearGradient id="lockShackle" x1="35" y1="10" x2="85" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="0.26" stopColor="#d9e0e5" />
          <stop offset="0.59" stopColor="#8895a2" />
          <stop offset="1" stopColor="#f7fbff" />
        </linearGradient>
        <radialGradient id="lockHalo" cx="0" cy="0" r="1" gradientTransform="translate(41 43) rotate(45) scale(80)">
          <stop stopColor="#ffccd0" stopOpacity="0.88" />
          <stop offset="1" stopColor="#ea1f2b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="56" cy="67" r="55" fill="url(#lockHalo)" opacity="0.45" />
      <path d="M33 59V44C33 13 79 13 79 44V59" fill="none" stroke="#4d5b67" strokeWidth="15" strokeLinecap="round" />
      <path d="M33 59V44C33 13 79 13 79 44V59" fill="none" stroke="url(#lockShackle)" strokeWidth="9" strokeLinecap="round" />
      <path d="M31 54H81C87 54 92 59 92 66V105C92 112 87 117 80 117H32C25 117 20 112 20 105V66C20 59 25 54 31 54Z" fill="url(#lockBody)" stroke="#67060e" strokeWidth="3" />
      <path d="M30 64C37 59 44 57 55 57C68 57 77 60 85 66" fill="none" stroke="#ffd9db" strokeOpacity="0.72" strokeWidth="3" strokeLinecap="round" />
      <path d="M73 61C81 69 84 85 80 104" fill="none" stroke="#790812" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="56" cy="84" r="10" fill="#360106" />
      <path d="M52.5 89L49.5 103H62.5L59.5 89" fill="#360106" />
      <circle cx="53" cy="80" r="2.5" fill="#fff" fillOpacity="0.56" />
    </svg>
  );
}

function ChainOverlay() {
  const chains = [
    "M-24 30C72 38 137 73 214 126C258 156 297 181 349 202",
    "M-30 171C75 175 145 182 225 193C278 200 311 204 360 204",
    "M-24 368C83 342 164 300 235 253C282 222 312 211 357 207",
    "M624 30C547 45 486 78 428 124C377 165 346 184 275 203",
    "M624 202C535 203 471 204 397 205C349 205 319 205 274 205",
    "M624 375C524 344 452 303 390 256C344 221 316 211 271 205",
  ];

  return (
    <svg
      className="premium-chain-art"
      viewBox="0 0 600 408"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="premiumChainRed" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffafb1" />
          <stop offset="0.18" stopColor="#ef4048" />
          <stop offset="0.52" stopColor="#a40815" />
          <stop offset="0.78" stopColor="#ef3a43" />
          <stop offset="1" stopColor="#6e010b" />
        </linearGradient>
        <filter id="premiumChainShadow" x="-15%" y="-20%" width="130%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#42020a" floodOpacity="0.66" />
        </filter>
      </defs>
      {chains.map((path, index) => (
        <g key={path} className={`premium-chain premium-chain-${index + 1}`} filter="url(#premiumChainShadow)">
          <path d={path} fill="none" stroke="#68030d" strokeWidth="16" strokeLinecap="round" opacity="0.92" />
          <path d={path} fill="none" stroke="url(#premiumChainRed)" strokeWidth="11" strokeLinecap="round" />
          <path d={path} fill="none" stroke="#ffd4d6" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 17" opacity="0.72" />
        </g>
      ))}
    </svg>
  );
}

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
      <ChainOverlay />
      <div className="premium-lock-stage">
        <button
          type="button"
          className={`premium-lock-button ${isShaking ? "is-shaking" : ""}`}
          onClick={shakeLock}
          onAnimationEnd={() => setIsShaking(false)}
          aria-label="এই Premium টেস্টটি লক করা আছে"
          title="Premium টেস্ট লক করা আছে"
        >
          <PadlockMark />
        </button>
        <p className="premium-lock-copy">Premium অ্যাক্সেস প্রয়োজন</p>
      </div>
    </article>
  );
}
