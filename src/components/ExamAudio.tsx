"use client";

import { useEffect, useRef, useState } from "react";

function formatClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "00:00";
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function ExamAudio({
  src,
  unrestricted = false,
  compact = false,
}: {
  src: string;
  unrestricted?: boolean;
  compact?: boolean;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const furthest = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxHeard, setMaxHeard] = useState(0);
  const [volume, setVolume] = useState(0.9);

  useEffect(() => {
    furthest.current = 0;
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setMaxHeard(0);
  }, [src]);

  const togglePlay = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  const rewindFive = () => {
    const el = audio.current;
    if (!el) return;
    const next = Math.max(0, el.currentTime - 5);
    el.currentTime = next;
    setCurrent(next);
  };

  const onScrub = (nextValue: number) => {
    const el = audio.current;
    if (!el) return;
    const clamped = unrestricted
      ? Math.max(0, Math.min(duration || 0, nextValue))
      : Math.max(0, Math.min(furthest.current, nextValue));
    el.currentTime = clamped;
    setCurrent(clamped);
  };

  const onVolume = (nextVol: number) => {
    setVolume(nextVol);
    if (audio.current) {
      audio.current.volume = nextVol;
    }
  };

  const progressPct =
    duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  const heardPct =
    duration > 0
      ? Math.min(100, ((unrestricted ? duration : maxHeard) / duration) * 100)
      : 0;

  return (
    <div className="skeuo-chassis relative overflow-hidden rounded-xl p-3.5 sm:p-4">
      {/* Corner hardware screws */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2 left-2 h-2 w-2 rounded-full border border-black/80 bg-gradient-to-b from-stone-400 to-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2 right-2 h-2 w-2 rounded-full border border-black/80 bg-gradient-to-b from-stone-400 to-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
      />

      <audio
        ref={audio}
        preload="metadata"
        src={src}
        controlsList="nodownload noplaybackrate"
        onContextMenu={(event) => event.preventDefault()}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={() => {
          const el = audio.current;
          if (el && Number.isFinite(el.duration)) setDuration(el.duration);
        }}
        onRateChange={() => {
          if (!unrestricted && audio.current && audio.current.playbackRate !== 1) {
            audio.current.playbackRate = 1;
          }
        }}
        onTimeUpdate={() => {
          const el = audio.current;
          if (!el) return;
          if (!unrestricted && el.currentTime > furthest.current + 0.8) {
            el.currentTime = furthest.current;
          } else {
            furthest.current = Math.max(furthest.current, el.currentTime);
            setMaxHeard(furthest.current);
          }
          setCurrent(el.currentTime);
          if (el.duration && Number.isFinite(el.duration)) {
            setDuration(el.duration);
          }
        }}
        onSeeking={() => {
          const el = audio.current;
          if (!unrestricted && el && el.currentTime > furthest.current + 0.8) {
            el.currentTime = furthest.current;
          }
        }}
        className="hidden"
      />

      {/* Top cassette window & LCD deck row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          {/* Twin tape reels window */}
          <div
            aria-hidden="true"
            className="flex items-center gap-2 rounded-md border border-black/80 bg-gradient-to-b from-[#111316] to-[#1d2026] px-2.5 py-1.5 shadow-[inset_0_2px_5px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.1)]"
          >
            {[0, 1].map((reel) => (
              <span
                key={reel}
                className={`grid h-5 w-5 place-items-center rounded-full border border-stone-500/60 bg-gradient-to-b from-stone-300 to-stone-500 text-[#15171a] ${
                  playing ? "anim-reel" : ""
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#15171a]" />
              </span>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
              {unrestricted ? "DEMO DECK · CH-A" : "MASTER DECK · LOCKED 1.0×"}
            </p>
            <div className="mt-1 flex items-center gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                <span
                  key={bar}
                  className={`h-1.5 w-2.5 rounded-[1px] transition-opacity ${
                    playing
                      ? bar < 4
                        ? "bg-emerald-400 opacity-95"
                        : bar < 6
                          ? "bg-amber-400 opacity-85"
                          : "bg-rose-500 opacity-75"
                      : "bg-stone-700 opacity-45"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Phosphor digital counter */}
        <div className="skeuo-lcd rounded px-2.5 py-1 font-mono text-xs font-bold tracking-wider">
          {formatClock(current)}{" "}
          <span className="text-emerald-500/50">/</span>{" "}
          {duration > 0 ? formatClock(duration) : "--:--"}
        </div>
      </div>

      {/* Transport keys + studio slider rail */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause audio" : "Play audio"}
            className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-xs font-bold ${
              playing ? "btn-red" : "skeuo-key text-[#1A1A1A]"
            }`}
          >
            <span>{playing ? "❚❚" : "▶"}</span>
            <span>{playing ? "PAUSE" : "PLAY"}</span>
          </button>
          <button
            type="button"
            onClick={rewindFive}
            title="৫ সেকেন্ড পেছনে যান"
            className="skeuo-key h-9 rounded-md px-2.5 font-mono text-[11px] font-bold text-[#1A1A1A]"
          >
            ↺ -5s
          </button>
        </div>

        {/* Recessed fader slot with heard-range indicator */}
        <div className="relative min-w-[140px] flex-1">
          <div className="relative h-3 overflow-hidden rounded-full border border-black/80 bg-[#0f1114] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]">
            <div
              className="absolute inset-y-0 left-0 bg-stone-600/45"
              style={{ width: `${heardPct}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(1, duration)}
            step={0.1}
            value={current}
            aria-label="Audio position"
            onChange={(e) => onScrub(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        {/* Studio gain fader */}
        {!compact && (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="font-mono text-[10px] font-bold tracking-wider text-stone-400">
              VOL
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              aria-label="Audio volume"
              onChange={(e) => onVolume(Number(e.target.value))}
              className="skeuo-fader w-20"
            />
          </div>
        )}
      </div>

      {!unrestricted && !compact && (
        <p className="mt-2.5 text-[11px] text-stone-400">
          অডিও এগিয়ে নেওয়া বা playback speed বদলানো যাবে না। শোনা অংশ আবার শুনতে পারবেন।
        </p>
      )}
    </div>
  );
}
