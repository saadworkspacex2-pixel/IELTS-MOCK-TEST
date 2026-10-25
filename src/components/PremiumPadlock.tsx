import type { SVGProps } from "react";

type PremiumPadlockProps = {
  unlocked?: boolean;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, "className">;

/** Shared Premium lock artwork for locked test cards and active memberships. */
export default function PremiumPadlock({ unlocked = false, className = "", ...svgProps }: PremiumPadlockProps) {
  return (
    <svg viewBox="0 0 112 128" aria-hidden="true" className={`premium-lock-icon ${className}`} {...svgProps}>
      <defs>
        <linearGradient id="premiumLockBody" x1="18" y1="42" x2="97" y2="117" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7f7" />
          <stop offset="0.18" stopColor="#f36b70" />
          <stop offset="0.52" stopColor="#c41421" />
          <stop offset="0.78" stopColor="#8e0712" />
          <stop offset="1" stopColor="#53020a" />
        </linearGradient>
        <linearGradient id="premiumLockShackle" x1="35" y1="10" x2="85" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="0.26" stopColor="#d9e0e5" />
          <stop offset="0.59" stopColor="#8895a2" />
          <stop offset="1" stopColor="#f7fbff" />
        </linearGradient>
        <radialGradient id="premiumLockHalo" cx="0" cy="0" r="1" gradientTransform="translate(41 43) rotate(45) scale(80)">
          <stop stopColor="#ffccd0" stopOpacity="0.88" />
          <stop offset="1" stopColor="#ea1f2b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="56" cy="67" r="55" fill="url(#premiumLockHalo)" opacity={unlocked ? "0.58" : "0.45"} />
      {unlocked ? (
        <>
          <path d="M33 59V44C33 13 79 13 79 39" fill="none" stroke="#4d5b67" strokeWidth="15" strokeLinecap="round" />
          <path d="M33 59V44C33 13 79 13 79 39" fill="none" stroke="url(#premiumLockShackle)" strokeWidth="9" strokeLinecap="round" />
          <path d="M81.5 37.5 87 32" fill="none" stroke="#4d5b67" strokeWidth="6.2" strokeLinecap="round" />
          <path d="M81.5 37.5 87 32" fill="none" stroke="#f6fbff" strokeWidth="3.1" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M33 59V44C33 13 79 13 79 44V59" fill="none" stroke="#4d5b67" strokeWidth="15" strokeLinecap="round" />
          <path d="M33 59V44C33 13 79 13 79 44V59" fill="none" stroke="url(#premiumLockShackle)" strokeWidth="9" strokeLinecap="round" />
        </>
      )}
      <path d="M31 54H81C87 54 92 59 92 66V105C92 112 87 117 80 117H32C25 117 20 112 20 105V66C20 59 25 54 31 54Z" fill="url(#premiumLockBody)" stroke="#67060e" strokeWidth="3" />
      <path d="M30 64C37 59 44 57 55 57C68 57 77 60 85 66" fill="none" stroke="#ffd9db" strokeOpacity="0.72" strokeWidth="3" strokeLinecap="round" />
      <path d="M73 61C81 69 84 85 80 104" fill="none" stroke="#790812" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="56" cy="84" r="10" fill="#360106" />
      <path d="M52.5 89L49.5 103H62.5L59.5 89" fill="#360106" />
      <circle cx="53" cy="80" r="2.5" fill="#fff" fillOpacity="0.56" />
      {unlocked && <path d="M92 34l4-3M94 41l5 .5" stroke="#f4bf55" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />}
    </svg>
  );
}
