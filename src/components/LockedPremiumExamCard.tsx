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

type ChainLink = { x: number; y: number; angle: number };

function ChainOverlay() {
  // Each route is built from visible, alternating oval links rather than a
  // dotted stroke. The rings overlap just like a physical chain around a lock.
  const chains: ChainLink[][] = [
    [{ x: -10, y: 23, angle: -28 }, { x: 38, y: 44, angle: 58 }, { x: 87, y: 69, angle: -28 }, { x: 136, y: 99, angle: 60 }, { x: 185, y: 132, angle: -28 }, { x: 233, y: 163, angle: 60 }, { x: 285, y: 190, angle: -28 }],
    [{ x: -8, y: 168, angle: 0 }, { x: 45, y: 174, angle: 90 }, { x: 98, y: 181, angle: 0 }, { x: 151, y: 188, angle: 90 }, { x: 204, y: 194, angle: 0 }, { x: 257, y: 199, angle: 90 }, { x: 309, y: 203, angle: 0 }],
    [{ x: -8, y: 376, angle: 25 }, { x: 44, y: 355, angle: -62 }, { x: 95, y: 331, angle: 25 }, { x: 146, y: 301, angle: -62 }, { x: 196, y: 266, angle: 25 }, { x: 247, y: 232, angle: -62 }, { x: 296, y: 211, angle: 25 }],
    [{ x: 610, y: 22, angle: 28 }, { x: 561, y: 46, angle: -58 }, { x: 512, y: 74, angle: 28 }, { x: 463, y: 107, angle: -58 }, { x: 415, y: 141, angle: 28 }, { x: 366, y: 172, angle: -58 }, { x: 316, y: 195, angle: 28 }],
    [{ x: 610, y: 202, angle: 0 }, { x: 557, y: 203, angle: 90 }, { x: 504, y: 204, angle: 0 }, { x: 451, y: 204, angle: 90 }, { x: 398, y: 205, angle: 0 }, { x: 345, y: 205, angle: 90 }, { x: 293, y: 205, angle: 0 }],
    [{ x: 610, y: 382, angle: -25 }, { x: 558, y: 358, angle: 62 }, { x: 507, y: 333, angle: -25 }, { x: 456, y: 302, angle: 62 }, { x: 405, y: 267, angle: -25 }, { x: 354, y: 233, angle: 62 }, { x: 305, y: 211, angle: -25 }],
  ];

  return (
    <svg className="premium-chain-art" viewBox="0 0 600 408" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="premiumChainMetal" x1="-18" y1="-8" x2="18" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd3d5" />
          <stop offset="0.18" stopColor="#ec5960" />
          <stop offset="0.46" stopColor="#a30a15" />
          <stop offset="0.72" stopColor="#ef6970" />
          <stop offset="1" stopColor="#71030c" />
        </linearGradient>
        <filter id="premiumChainShadow" x="-25%" y="-35%" width="150%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.8" floodColor="#390107" floodOpacity="0.62" />
        </filter>
      </defs>
      {chains.map((chain, chainIndex) => (
        <g key={chainIndex} className={`premium-chain premium-chain-${chainIndex + 1}`} filter="url(#premiumChainShadow)">
          {chain.map((link, linkIndex) => (
            <g key={`${link.x}-${link.y}`} className="premium-chain-link" transform={`translate(${link.x} ${link.y}) rotate(${link.angle})`}>
              <ellipse rx="18" ry="7.6" fill="none" stroke="#5e040d" strokeWidth="6.8" />
              <ellipse rx="18" ry="7.6" fill="none" stroke="url(#premiumChainMetal)" strokeWidth="4.3" />
              <path d="M-11 -3.6C-5 -6.5 5 -6.5 11 -3.6" fill="none" stroke="#ffe6e7" strokeWidth="1.25" strokeLinecap="round" opacity="0.88" />
              {linkIndex % 2 === 1 && <ellipse rx="11.5" ry="3.4" fill="none" stroke="#78050e" strokeWidth="1.2" opacity="0.72" />}
            </g>
          ))}
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
