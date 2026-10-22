"use client";

type SkeuoTimerProps = {
  secondsLeft: number;
  totalSeconds?: number;
  compact?: boolean;
};

export default function SkeuoTimer({
  secondsLeft,
  totalSeconds,
  compact = false,
}: SkeuoTimerProps) {
  const safeSeconds = Math.max(0, Math.floor(secondsLeft));
  const hours = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  const danger = safeSeconds <= 300;

  const maxSec = Math.max(1, totalSeconds ?? Math.max(safeSeconds, 1200));
  const ratio = Math.max(0, Math.min(1, safeSeconds / maxSec));
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div
      role="timer"
      aria-label="পরীক্ষার বাকি সময়"
      className={`inline-flex items-center gap-2.5 rounded-lg border px-2.5 py-1 ${
        danger
          ? "border-rose-500/50 bg-gradient-to-b from-[#2f1619] to-[#1b0c0e] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_6px_rgba(0,0,0,0.45)]"
          : "border-white/15 bg-gradient-to-b from-[#2c3036] to-[#181b1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_2px_6px_rgba(0,0,0,0.45)]"
      }`}
    >
      {/* Analog chronometer dial gauge */}
      {!compact && (
        <span
          aria-hidden="true"
          className="relative hidden h-7 w-7 shrink-0 place-items-center rounded-full border border-black/70 bg-gradient-to-b from-[#111417] to-[#23282e] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.12)] sm:grid"
        >
          <svg width="26" height="26" viewBox="0 0 28 28" className="-rotate-90">
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2.4"
            />
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="none"
              stroke={danger ? "#f87171" : "#34d399"}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span
            className={`absolute h-1.5 w-1.5 rounded-full ${
              danger
                ? "animate-ping bg-rose-400"
                : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
            }`}
          />
        </span>
      )}

      {/* Recessed phosphor digital readout */}
      <div
        className={`relative overflow-hidden rounded px-2.5 py-1 font-mono text-sm font-bold tracking-[0.14em] sm:text-base ${
          danger ? "skeuo-lcd-danger animate-pulse" : "skeuo-lcd"
        }`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent"
        />
        {String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:
        {String(secs).padStart(2, "0")}
      </div>

      {!compact && (
        <span className="hidden pr-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 md:inline">
          {danger ? "FINAL" : "LEFT"}
        </span>
      )}
    </div>
  );
}
