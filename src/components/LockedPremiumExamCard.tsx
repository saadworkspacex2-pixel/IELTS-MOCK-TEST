"use client";

import Link from "next/link";
import { useId, useState } from "react";

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

type SteelLinkProps = {
  link: ChainLink;
  metalId: string;
  highlightId: string;
};

function SteelLink({ link, metalId, highlightId }: SteelLinkProps) {
  return (
    <g
      className="premium-chain-link"
      transform={`translate(${link.x} ${link.y}) rotate(${link.angle})`}
    >
      {/* Dark tube edge, polished steel face, then small wear/highlight details. */}
      <ellipse rx="23" ry="11.4" fill="none" stroke="#0b1118" strokeWidth="10" opacity="0.94" />
      <ellipse rx="22.6" ry="11" fill="none" stroke={`url(#${metalId})`} strokeWidth="7.35" />
      <ellipse rx="18.65" ry="7.1" fill="none" stroke="#071019" strokeWidth="1.35" opacity="0.86" />
      <path
        d="M-15.6 -6.15C-9.4 -9.35 8.8 -9.35 15.6 -6.15"
        fill="none"
        stroke={`url(#${highlightId})`}
        strokeWidth="1.85"
        strokeLinecap="round"
        opacity="0.94"
      />
      <path
        d="M-15.2 6.2C-8 9.45 8 9.45 15.4 6.15"
        fill="none"
        stroke="#2b3640"
        strokeWidth="1.55"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path d="M-21 -1.9C-22.3 0 -22.3 2 -21 3.7" fill="none" stroke="#e9f3f7" strokeWidth="1.1" opacity="0.55" />
    </g>
  );
}

function ChainOverlay() {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const metalId = `premiumSteel-${instanceId}`;
  const highlightId = `premiumSteelHighlight-${instanceId}`;
  const shadowId = `premiumChainShadow-${instanceId}`;

  // Six independent, physical-looking routes converge under the lock. Links
  // intentionally alternate direction, so the chain reads as interlocked metal
  // rather than a painted/dashed line.
  const chains: ChainLink[][] = [
    [{ x: -22, y: 16, angle: -27 }, { x: 26, y: 36, angle: 61 }, { x: 75, y: 60, angle: -27 }, { x: 123, y: 88, angle: 61 }, { x: 170, y: 120, angle: -27 }, { x: 216, y: 153, angle: 61 }, { x: 260, y: 181, angle: -27 }, { x: 293, y: 199, angle: 61 }],
    [{ x: -20, y: 167, angle: 2 }, { x: 33, y: 173, angle: 91 }, { x: 87, y: 180, angle: 2 }, { x: 141, y: 187, angle: 91 }, { x: 195, y: 193, angle: 2 }, { x: 248, y: 198, angle: 91 }, { x: 297, y: 202, angle: 2 }],
    [{ x: -20, y: 391, angle: 26 }, { x: 31, y: 369, angle: -61 }, { x: 82, y: 344, angle: 26 }, { x: 132, y: 315, angle: -61 }, { x: 181, y: 280, angle: 26 }, { x: 229, y: 245, angle: -61 }, { x: 274, y: 218, angle: 26 }, { x: 302, y: 206, angle: -61 }],
    [{ x: 622, y: 15, angle: 27 }, { x: 574, y: 38, angle: -61 }, { x: 526, y: 64, angle: 27 }, { x: 478, y: 95, angle: -61 }, { x: 431, y: 128, angle: 27 }, { x: 384, y: 160, angle: -61 }, { x: 339, y: 185, angle: 27 }, { x: 308, y: 199, angle: -61 }],
    [{ x: 622, y: 202, angle: -2 }, { x: 568, y: 202, angle: 89 }, { x: 514, y: 203, angle: -2 }, { x: 460, y: 203, angle: 89 }, { x: 406, y: 204, angle: -2 }, { x: 352, y: 204, angle: 89 }, { x: 303, y: 204, angle: -2 }],
    [{ x: 622, y: 391, angle: -26 }, { x: 570, y: 368, angle: 61 }, { x: 519, y: 343, angle: -26 }, { x: 468, y: 313, angle: 61 }, { x: 418, y: 279, angle: -26 }, { x: 370, y: 245, angle: 61 }, { x: 325, y: 218, angle: -26 }, { x: 299, y: 206, angle: 61 }],
  ];

  return (
    <svg className="premium-chain-art" viewBox="0 0 600 408" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={metalId} x1="0" y1="0" x2="0.82" y2="1">
          <stop stopColor="#f8ffff" />
          <stop offset="0.12" stopColor="#bfcbd2" />
          <stop offset="0.34" stopColor="#596875" />
          <stop offset="0.55" stopColor="#e2edf1" />
          <stop offset="0.71" stopColor="#71818c" />
          <stop offset="1" stopColor="#1b2630" />
        </linearGradient>
        <linearGradient id={highlightId} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#8fa2ac" stopOpacity="0" />
          <stop offset="0.26" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#dceaf0" />
          <stop offset="1" stopColor="#8fa2ac" stopOpacity="0" />
        </linearGradient>
        <filter id={shadowId} x="-35%" y="-45%" width="170%" height="190%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.65" floodColor="#071019" floodOpacity="0.7" />
          <feDropShadow dx="0" dy="0.7" stdDeviation="0.45" floodColor="#ffffff" floodOpacity="0.35" />
        </filter>
      </defs>
      {chains.map((chain, chainIndex) => (
        <g key={chainIndex} className={`premium-chain premium-chain-${chainIndex + 1}`} filter={`url(#${shadowId})`}>
          {chain.filter((_, index) => index % 2 === 0).map((link) => (
            <SteelLink key={`${link.x}-${link.y}`} link={link} metalId={metalId} highlightId={highlightId} />
          ))}
          {chain.filter((_, index) => index % 2 === 1).map((link) => (
            <SteelLink key={`${link.x}-${link.y}`} link={link} metalId={metalId} highlightId={highlightId} />
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
