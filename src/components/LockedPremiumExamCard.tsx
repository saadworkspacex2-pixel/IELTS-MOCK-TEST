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

type ChainRoute = {
  from: [number, number];
  to: [number, number];
  sway: number;
  phase: number;
};

type SteelLinkProps = {
  link: ChainLink;
  metalId: string;
  highlightId: string;
  isFrontLink: boolean;
};

function SteelLink({ link, metalId, highlightId, isFrontLink }: SteelLinkProps) {
  return (
    <g
      className="premium-chain-link"
      transform={`translate(${link.x} ${link.y}) rotate(${link.angle})`}
    >
      {/* A long, dark-edged forged link: the silhouette and overlap match a real hanging chain. */}
      <ellipse rx="11.6" ry="22.8" fill="none" stroke="#060708" strokeWidth="9.2" opacity="0.98" />
      <ellipse rx="11.25" ry="22.45" fill="none" stroke={`url(#${metalId})`} strokeWidth="6.45" />
      <ellipse rx="7.75" ry="18.8" fill="none" stroke="#07090a" strokeWidth="1.2" opacity="0.9" />
      <path
        d="M-7.4 -15.6C-10 -10 -10.1 8.2 -7.5 15.5"
        fill="none"
        stroke={`url(#${highlightId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.98"
      />
      <path
        d="M7.45 -15.4C10.2 -8.4 10.2 8.5 7.4 15.5"
        fill="none"
        stroke="#1e2020"
        strokeWidth="2.05"
        strokeLinecap="round"
        opacity="0.88"
      />
      <path d="M-5.3 -20.2C-1.6 -22.3 2.3 -22.3 5.5 -20.1" fill="none" stroke="#f4f2e9" strokeWidth="1.15" opacity="0.67" />
      {isFrontLink && <path d="M-9.1 0C-4.2 2.6 4.4 2.6 9.1 0" fill="none" stroke="#d5d2c8" strokeWidth="1.05" opacity="0.68" />}
    </g>
  );
}

function makeChain({ from, to, sway, phase }: ChainRoute): ChainLink[] {
  const linkCount = 12;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const normalX = -dy / length;
  const normalY = dx / length;
  const routeAngle = (Math.atan2(dx, dy) * 180) / Math.PI;

  return Array.from({ length: linkCount }, (_, index) => {
    const t = index / (linkCount - 1);
    // A restrained serpentine motion avoids ruler-straight links and gives the
    // chain the same weight and natural hand-drawn rhythm as the reference.
    const wave = Math.sin(t * Math.PI) * sway + Math.sin((t * 3.2 + phase) * Math.PI) * 2.25;
    return {
      x: from[0] + dx * t + normalX * wave,
      y: from[1] + dy * t + normalY * wave,
      angle: routeAngle + (index % 2 === 0 ? -4.2 : 4.2),
    };
  });
}

function ChainOverlay() {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const metalId = `premiumForgedSteel-${instanceId}`;
  const highlightId = `premiumForgedHighlight-${instanceId}`;
  const shadowId = `premiumChainShadow-${instanceId}`;

  // The six routes enter from each required side and converge behind the lock.
  const chains = [
    makeChain({ from: [-14, -24], to: [298, 200], sway: 8, phase: 0.08 }),
    makeChain({ from: [-16, 157], to: [298, 202], sway: 5, phase: 0.28 }),
    makeChain({ from: [-14, 430], to: [301, 207], sway: -9, phase: 0.53 }),
    makeChain({ from: [614, -24], to: [305, 200], sway: -8, phase: 0.76 }),
    makeChain({ from: [616, 157], to: [304, 202], sway: -5, phase: 0.46 }),
    makeChain({ from: [614, 430], to: [303, 207], sway: 9, phase: 0.19 }),
  ];

  return (
    <svg className="premium-chain-art" viewBox="0 0 600 408" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={metalId} x1="0" y1="0" x2="1" y2="0.86">
          <stop stopColor="#fbfaf2" />
          <stop offset="0.13" stopColor="#9f9e98" />
          <stop offset="0.34" stopColor="#25282a" />
          <stop offset="0.53" stopColor="#d7d5cc" />
          <stop offset="0.72" stopColor="#555754" />
          <stop offset="1" stopColor="#111314" />
        </linearGradient>
        <linearGradient id={highlightId} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="0.45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#a8a79e" stopOpacity="0" />
        </linearGradient>
        <filter id={shadowId} x="-40%" y="-35%" width="180%" height="170%">
          <feDropShadow dx="0" dy="3.15" stdDeviation="2.45" floodColor="#070707" floodOpacity="0.78" />
          <feDropShadow dx="0" dy="0.6" stdDeviation="0.3" floodColor="#ffffff" floodOpacity="0.3" />
        </filter>
      </defs>
      {chains.map((chain, chainIndex) => (
        <g key={chainIndex} className={`premium-chain premium-chain-${chainIndex + 1}`} filter={`url(#${shadowId})`}>
          {chain.filter((_, index) => index % 2 === 0).map((link) => (
            <SteelLink key={`${link.x}-${link.y}`} link={link} metalId={metalId} highlightId={highlightId} isFrontLink={false} />
          ))}
          {chain.filter((_, index) => index % 2 === 1).map((link) => (
            <SteelLink key={`${link.x}-${link.y}`} link={link} metalId={metalId} highlightId={highlightId} isFrontLink />
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
