"use client";

import SpringHeading from "@/components/SpringHeading";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Logo from "@/components/Logo";
import type { ExamRules } from "@/lib/examRules";
import ExamSplit from "@/components/ExamSplit";
import HighlightablePassage from "@/components/HighlightablePassage";
import ExamAudio from "@/components/ExamAudio";
import SkeuoTimer from "@/components/SkeuoTimer";

type Q = {
  id: number;
  sectionId: number | null;
  qtype: string;
  text: string;
  options: string[];
};
type Sec = {
  id: number;
  title: string;
  passageTitle: string;
  passageText: string;
  instruction: string;
  audioUrl: string;
};
type ExamInfo = {
  id: number;
  title: string;
  module: "mcq" | "reading" | "listening" | "writing";
  durationMinutes: number;
  negativeMark: number;
  marksPerQuestion: number;
  rules: ExamRules;
};

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function TakeExamClient({ examId }: { examId: number }) {
  const router = useRouter();
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [secs, setSecs] = useState<Sec[]>([]);
  const [questionList, setQuestionList] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [activePart, setActivePart] = useState(0);
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [essay, setEssay] = useState("");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [error, setError] = useState("");
  const startTime = useRef<number>(Date.now());
  const submitted = useRef(false);
  const qRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const sessionToken = useRef<string>(
    typeof window !== "undefined" ? crypto.randomUUID() : "",
  );
  const [optionOrders, setOptionOrders] = useState<Record<number, number[]>>({});
  const [sectionSeconds, setSectionSeconds] = useState<number | null>(null);
  const [fullscreenActive, setFullscreenActive] = useState(false);

  const studentName =
    typeof window !== "undefined"
      ? sessionStorage.getItem("mt_student_name")
      : null;

  useEffect(() => {
    if (!studentName) {
      router.replace(`/exams/${examId}`);
      return;
    }
    fetch(`/api/exams/${examId}/questions`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.exam) throw new Error("not found");
        setExam(data.exam);
        setSecs(data.sections ?? []);
        const incoming = (data.questions ?? []) as Q[];
        const shuffled = data.exam.rules?.shuffleQuestions ? [...incoming].sort(() => Math.random() - 0.5) : incoming;
        setQuestionList(shuffled);
        setActiveQ(shuffled[0]?.id ?? null);
        if (data.exam.rules?.shuffleOptions) {
          const orders: Record<number, number[]> = {};
          for (const q of shuffled) orders[q.id] = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
          setOptionOrders(orders);
        }
        setSecondsLeft(data.exam.durationMinutes * 60);
        startTime.current = Date.now();
      })
      .catch(() => setError("পরীক্ষা লোড করা যায়নি। আবার চেষ্টা করুন।"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  useEffect(() => {
    const syncFullscreen = () => setFullscreenActive(Boolean(document.fullscreenElement));
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {
      setError("পূর্ণস্ক্রিন চালু করতে ব্রাউজারের অনুমতি দিন।");
    });
  };

  // parts: sections if any, else one virtual part containing everything
  const parts = useMemo(() => {
    if (secs.length === 0) {
      return [
        {
          sec: null as Sec | null,
          questions: questionList,
        },
      ];
    }
    const knownIds = new Set(secs.map((s) => s.id));
    return secs.map((s, idx) => ({
      sec: s,
      questions: questionList.filter(
        (q) =>
          q.sectionId === s.id ||
          (idx === 0 && (!q.sectionId || !knownIds.has(q.sectionId))),
      ),
    }));
  }, [secs, questionList]);

  const flatNumber = useMemo(() => {
    const map: Record<number, number> = {};
    let n = 1;
    for (const p of parts) for (const q of p.questions) map[q.id] = n++;
    return map;
  }, [parts]);

  const submit = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          studentName,
          answers,
          essayText: essay,
          sessionToken: sessionToken.current,
          timeTakenSeconds: Math.round((Date.now() - startTime.current) / 1000),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "submit failed");
      router.replace(`/results/${data.attemptId}`);
    } catch {
      submitted.current = false;
      setSubmitting(false);
      setError("জমা দেওয়া যায়নি। সংযোগ দেখে আবার চেষ্টা করুন।");
    }
  }, [answers, essay, examId, router, studentName]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, submit]);

  // Live heartbeat for the admin monitoring desk
  useEffect(() => {
    if (!exam || !studentName) return;
    const beat = () => {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken.current,
          examId,
          studentName,
        }),
      }).catch(() => {});
    };
    beat();
    const t = setInterval(beat, 20000);
    return () => clearInterval(t);
  }, [exam, examId, studentName]);

  // Anti-cheat: switching tabs auto-submits when enabled for this exam
  useEffect(() => {
    if (!exam?.rules?.antiCheat) return;
    const onVisibility = () => {
      if (document.hidden) submit();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [exam, submit]);

  // Optional per-section timer
  const sectionMinutes = exam?.rules?.sectionTimeMinutes ?? 0;
  useEffect(() => {
    if (sectionMinutes > 0) setSectionSeconds(sectionMinutes * 60);
  }, [activePart, sectionMinutes]);
  useEffect(() => {
    if (sectionMinutes <= 0 || sectionSeconds === null) return;
    if (sectionSeconds <= 0) {
      if (activePart < parts.length - 1) setActivePart((p) => p + 1);
      else submit();
      return;
    }
    const t = setTimeout(() => setSectionSeconds((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [sectionSeconds, sectionMinutes, activePart, parts.length, submit]);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setPaletteOpen(true);
  }, []);

  const jumpTo = (q: Q) => {
    const pi = parts.findIndex((p) => p.questions.some((x) => x.id === q.id));
    if (pi >= 0 && pi !== activePart) setActivePart(pi);
    setActiveQ(q.id);
    if (window.innerWidth < 1024) setPaletteOpen(false);
    setTimeout(() => {
      qRefs.current[q.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 60);
  };

  if (error && !exam) {
    return (
      <div className="grid min-h-screen place-items-center bg-stone-100 px-4 text-slate-900">
        <div className="anim-pop rounded-md border border-rose-300 bg-white p-8 text-center">
          <p className="text-rose-600">{error}</p>
          <button
            onClick={() => router.push(`/exams/${examId}`)}
            className="mt-5 rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white"
          >
            ← ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  if (!exam || secondsLeft === null) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-stone-100">
        <div className="h-14 shrink-0 bg-[#1A1A1A]" />
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
          <div className="space-y-3 border-r border-stone-200 bg-white p-8">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer h-6 w-2/3 rounded" />
            <div className="shimmer mt-6 h-3 w-full rounded" />
            <div className="shimmer h-3 w-11/12 rounded" />
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-4/5 rounded" />
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-3/5 rounded" />
          </div>
          <div className="space-y-4 p-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-md border border-stone-200 bg-white p-5">
                <div className="shimmer h-4 w-5/6 rounded" />
                <div className="mt-3 space-y-2">
                  <div className="shimmer h-9 w-full rounded" />
                  <div className="shimmer h-9 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex h-12 shrink-0 items-center gap-2 border-t border-stone-200 bg-white px-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="shimmer h-7 w-7 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const isWriting = exam.module === "writing";
  const isReading = exam.module === "reading" || exam.module === "listening";
  const part = parts[Math.min(activePart, parts.length - 1)];
  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[Number(k)];
    return !(typeof v === "string" && v.trim() === "");
  }).length;
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const renderQuestion = (q: Q) => {
    const num = flatNumber[q.id];
    const val = answers[q.id];
    const flagged = Boolean(flags[q.id]);
    return (
      <div
        key={q.id}
        ref={(el) => {
          qRefs.current[q.id] = el;
        }}
        onClick={() => setActiveQ(q.id)}
        className={`card rounded-xl p-5 transition-all ${
          activeQ === q.id
            ? "ring-2 ring-[#E51A24]/30"
            : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium leading-relaxed text-[#1A1A1A]">
            <span className="btn-ink mr-2.5 inline-grid h-7 w-7 place-items-center rounded-md text-center text-sm font-bold">
              {num}
            </span>
            {q.text}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-[11px] font-semibold text-[#6C757D] sm:inline">
              রিভিউ
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={flagged}
              aria-label={`প্রশ্ন ${num} রিভিউ ফ্ল্যাগ`}
              onClick={(e) => {
                e.stopPropagation();
                setFlags((f) => ({ ...f, [q.id]: !f[q.id] }));
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                flagged ? "bg-amber-500" : "bg-stone-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full transition-transform ${
                  flagged ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {q.qtype === "gap" ? (
          <input
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            placeholder="উত্তর টাইপ করুন…"
            className="mt-4 w-full max-w-sm rounded-lg px-4 py-2.5 text-sm outline-none"
          />
        ) : q.qtype === "essay" ? (
          <textarea
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            rows={7}
            placeholder="আপনার উত্তর লিখুন… ইনস্ট্রাক্টর মূল্যায়ন করবেন"
            className="mt-4 w-full rounded-lg px-4 py-3 text-sm leading-relaxed outline-none"
          />
        ) : q.qtype === "dnd" ? (
          <div className="mt-4 space-y-2.5">
            <p className="text-xs font-medium text-[#6C757D]">
              টাইলগুলো ড্র্যাগ করে সঠিক ক্রমে সাজান (অথবা ↑ ↓ নব চাপুন)
            </p>
            {(() => {
              const rawBase = optionOrders[q.id] ?? q.options.map((_, i) => i);
              const base = rawBase.length > 1 ? [...rawBase.slice(1), rawBase[0]] : rawBase;
              const order = typeof val === "string" && val
                ? val.split(",").map(Number)
                : base.filter((i) => q.options[i] !== "");
              const setOrder = (arr: number[]) => setAnswers((a) => ({ ...a, [q.id]: arr.join(",") }));
              return order.map((orig, idx) => (
                <div
                  key={orig}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", String(idx))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = Number(e.dataTransfer.getData("text/plain"));
                    if (from === idx) return;
                    const next = [...order];
                    const [moved] = next.splice(from, 1);
                    next.splice(idx, 0, moved);
                    setOrder(next);
                  }}
                  className="skeuo-key flex cursor-move items-center gap-3 rounded-lg px-4 py-2.5 text-sm"
                >
                  <span className="skeuo-well rounded px-2 py-0.5 font-mono text-xs font-bold text-[#6C757D]">
                    ≡ {idx + 1}
                  </span>
                  <span className="flex-1 font-medium">{q.options[orig]}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (idx === 0) return;
                      const next = [...order];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      setOrder(next);
                    }}
                    className="skeuo-key rounded px-2 py-1 text-xs font-bold"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (idx === order.length - 1) return;
                      const next = [...order];
                      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                      setOrder(next);
                    }}
                    className="skeuo-key rounded px-2 py-1 text-xs font-bold"
                  >
                    ↓
                  </button>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {(optionOrders[q.id] ?? q.options.map((_, i) => i))
              .filter((orig) => q.options[orig] !== "")
              .map((orig) => {
                const opt = q.options[orig];
                const selected = val === orig;
                return (
                  <label
                    key={orig}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all ${
                      selected ? "btn-ink" : "skeuo-key"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selected}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: orig }))}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                        selected
                          ? "border-emerald-300 bg-emerald-400/20"
                          : "border-stone-400 bg-stone-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]"
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      )}
                    </span>
                    {q.qtype === "tfng" ? (
                      <span className="font-semibold tracking-wide">{opt}</span>
                    ) : (
                      <span>
                        <b className="mr-1.5">{OPTION_LABELS[orig]}</b>
                        {opt}
                      </span>
                    )}
                  </label>
                );
              })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="skeuo-desk flex h-screen flex-col overflow-hidden text-[#1A1A1A]">
      {!fullscreenActive && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-slate-950/80 px-5 backdrop-blur-sm">
          <div className="card w-full max-w-md rounded-2xl p-7 text-center">
            <p className="text-xs font-bold tracking-[0.18em] text-[#E51A24]">EXAM MODE</p>
            <SpringHeading as="h2" className="mt-3 text-2xl font-bold">পূর্ণস্ক্রিনে পরীক্ষা শুরু করুন</SpringHeading>
            <p className="mt-3 text-sm leading-relaxed text-[#6C757D]">পরীক্ষার সময় ফোকাস ধরে রাখতে এই টেস্টটি পূর্ণস্ক্রিন মোডে চলবে। ব্রাউজার অনুমতি চাইলে Allow/Full Screen দিন।</p>
            <button type="button" onClick={enterFullscreen} className="btn-red mt-6 w-full rounded-lg py-3.5 text-sm font-bold">পূর্ণস্ক্রিন চালু করুন</button>
          </div>
        </div>
      )}
      {/* ===== Brushed hardware exam console bar ===== */}
      <header className="skeuo-chassis z-30 flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Logo href={null} dark showText={false} className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-stone-100">{exam.title}</p>
            <p className="truncate text-[11px] font-medium text-stone-400">
              CANDIDATE · {studentName}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <SkeuoTimer
            secondsLeft={secondsLeft}
            totalSeconds={exam.durationMinutes * 60}
          />
          {!isWriting && (
            <button
              type="button"
              onClick={() => setPaletteOpen((open) => !open)}
              aria-expanded={paletteOpen}
              className={`rounded-md px-3 py-2 text-xs font-bold transition ${
                paletteOpen
                  ? "skeuo-key-pressed border border-black/50 bg-stone-800 text-emerald-300"
                  : "skeuo-key text-[#1A1A1A]"
              }`}
            >
              প্যালেট
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="btn-red rounded-md px-3.5 py-2 text-sm font-bold sm:px-4"
          >
            জমা দিন
          </button>
        </div>
      </header>

      {/* ===== Physical folder-tab switcher ===== */}
      {parts.length > 1 && (
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-black/[0.08] bg-white px-4 py-2">
          <div className="skeuo-well flex items-center gap-1 rounded-lg p-1">
            {parts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActivePart(i)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  i === activePart
                    ? "btn-ink"
                    : "text-[#6C757D] hover:text-[#1A1A1A]"
                }`}
              >
                {p.sec?.title ?? `Part ${i + 1}`}
                {!isWriting && ` (${p.questions.length})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== Desk body + docked punchboard palette ===== */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {isWriting ? (
            /* -------- WRITING: stationery prompt sheet left, answer booklet right -------- */
            <ExamSplit
              initial={50}
              leftLabel="Task Prompt"
              rightLabel="Your Answer"
              className="min-h-0 flex-1"
              left={
                <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                  {part.sec ? (
                    <div className="skeuo-paper flex min-h-full overflow-hidden rounded-xl">
                      <div className="skeuo-binder hidden sm:flex" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className="flex-1 p-5 sm:p-7">
                        <p className="text-xs font-bold tracking-widest text-[#6C757D] uppercase">
                          {part.sec.title} · Official Prompt Sheet
                        </p>
                        <SpringHeading as="h2" className="mt-2 text-xl font-bold">
                          {part.sec.passageTitle}
                        </SpringHeading>
                        {part.sec.instruction && (
                          <p className="skeuo-well mt-3 rounded-lg px-4 py-3 text-sm font-medium text-amber-900">
                            {part.sec.instruction}
                          </p>
                        )}
                        <div className="mt-5 space-y-4 leading-8 whitespace-pre-line text-[#212529]">
                          {part.sec.passageText}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#6C757D]">কোনো টাস্ক যোগ করা হয়নি।</p>
                  )}
                </div>
              }
              right={
                <div className="flex h-full min-h-0 flex-col overflow-hidden p-4 sm:p-6">
                  <div className="card flex shrink-0 items-center justify-between rounded-xl px-5 py-3">
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      আপনার উত্তরপত্র
                    </p>
                    <p
                      className={`skeuo-well rounded px-3 py-1 font-mono text-xs font-bold ${
                        wordCount >= 150 ? "text-emerald-700" : "text-[#6C757D]"
                      }`}
                    >
                      WORDS: {wordCount}
                    </p>
                  </div>
                  <textarea
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    placeholder="এখানে লিখুন… (জমা দেওয়ার পর ইনস্ট্রাক্টর মূল্যায়ন করবেন)"
                    className="mt-3 min-h-0 flex-1 resize-none rounded-xl p-6 leading-8 outline-none"
                  />
                </div>
              }
            />
          ) : isReading ? (
            /* -------- READING / LISTENING: perforated paper sheet left, ledger cards right -------- */
            <ExamSplit
              initial={50}
              leftLabel={
                exam.module === "listening" ? "Audio / Transcript" : "Passage"
              }
              rightLabel="Questions"
              className="min-h-0 flex-1"
              left={
                <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                  {part.sec ? (
                    <div className="skeuo-paper flex min-h-full overflow-hidden rounded-xl">
                      <div className="skeuo-binder hidden sm:flex" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className="flex-1 p-5 sm:p-7">
                        <p className="text-xs font-bold tracking-widest text-[#6C757D] uppercase">
                          {part.sec.title}
                        </p>
                        <SpringHeading as="h2" className="mt-2 text-xl font-bold">
                          {part.sec.passageTitle}
                        </SpringHeading>
                        {part.sec.audioUrl && (
                          <div className="mt-4">
                            <ExamAudio src={part.sec.audioUrl} />
                          </div>
                        )}
                        <div className="mt-5">
                          <HighlightablePassage
                            key={part.sec.id}
                            text={part.sec.passageText}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#6C757D]">
                      এই পরীক্ষায় কোনো প্যাসেজ বা অডিও সেকশন যোগ করা হয়নি।
                    </p>
                  )}
                </div>
              }
              right={
                <div className="h-full overflow-y-auto p-4 sm:p-6">
                  {part.sec?.instruction && (
                    <p className="skeuo-well mb-4 rounded-lg px-4 py-3 text-sm font-semibold text-amber-900">
                      {part.sec.instruction}
                    </p>
                  )}
                  <div className="space-y-4">
                    {part.questions.map((q) => renderQuestion(q))}
                    {part.questions.length === 0 && (
                      <p className="py-10 text-center text-sm text-[#6C757D]">
                        এই অংশে কোনো প্রশ্ন নেই।
                      </p>
                    )}
                  </div>
                </div>
              }
            />
          ) : (
            /* -------- MCQ: single scrollable desk -------- */
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
                {part.sec?.instruction && (
                  <p className="skeuo-well rounded-lg px-4 py-3 text-sm font-semibold text-amber-900">
                    {part.sec.instruction}
                  </p>
                )}
                {part.questions.map((q) => renderQuestion(q))}
                {part.questions.length === 0 && (
                  <p className="py-16 text-center text-[#6C757D]">
                    এই পরীক্ষায় কোনো প্রশ্ন নেই।
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== Collapsible docked punchboard palette ===== */}
        {!isWriting && paletteOpen && (
          <aside className="anim-fade-in card fixed top-16 bottom-0 right-0 z-40 w-[min(20rem,90vw)] overflow-y-auto border-l border-black/[0.08] px-4 py-4 lg:static lg:inset-auto lg:w-72 lg:shrink-0 lg:rounded-none">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                Question Palette
              </p>
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                aria-label="প্যালেট বন্ধ করুন"
                className="skeuo-key rounded px-2 py-0.5 text-xs font-bold"
              >
                ×
              </button>
              <div className="skeuo-well flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-semibold text-[#6C757D]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#23262b]" />
                  উত্তর {answeredCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm border border-stone-400 bg-white" />
                  বাকি {questionList.length - answeredCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                  রিভিউ
                </span>
              </div>
            </div>
            <div className="space-y-3.5">
              {parts.map((p, pi) => (
                <section
                  key={pi}
                  className={pi > 0 ? "border-t border-black/[0.08] pt-3" : ""}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePart(pi)}
                      className={`rounded-md px-3 py-1 text-xs font-bold whitespace-nowrap transition ${
                        pi === activePart ? "btn-ink" : "skeuo-key"
                      }`}
                    >
                      {p.sec?.title ?? "প্রশ্নপত্র"}
                    </button>
                    <span className="text-[10px] font-semibold text-[#6C757D]">
                      {p.questions.length}টি প্রশ্ন
                    </span>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(2.1rem,1fr))] gap-1.5">
                    {p.questions.map((q) => {
                      const v = answers[q.id];
                      const done =
                        v !== undefined &&
                        !(typeof v === "string" && v.trim() === "");
                      const flagged = flags[q.id];
                      const current = activeQ === q.id;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => jumpTo(q)}
                          aria-current={current ? "true" : undefined}
                          title={`${done ? "উত্তর দেওয়া" : "উত্তর দেওয়া হয়নি"}${flagged ? " · Review flagged" : ""}`}
                          className={`relative grid h-8 min-w-8 place-items-center rounded-md text-xs font-bold transition-all ${
                            done ? "btn-ink" : "skeuo-key text-[#6C757D]"
                          } ${
                            current
                              ? "anim-current-ring ring-2 ring-emerald-600 ring-offset-1"
                              : ""
                          }`}
                        >
                          {flatNumber[q.id]}
                          {flagged && (
                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </aside>
        )}
      </div>
      {error && (
        <p className="bg-rose-50 px-4 py-2 text-center text-sm text-rose-600">
          {error}
        </p>
      )}

      {/* Confirm hardware dialog */}
      {showConfirm && (
        <div className="anim-fade-in fixed inset-0 z-50 grid place-items-center bg-black/55 px-4 backdrop-blur-[2px]">
          <div className="anim-pop card w-full max-w-md rounded-2xl p-7">
            <SpringHeading as="h3" className="text-xl font-bold">
              টেস্ট জমা দেবেন?
            </SpringHeading>
            <div className="skeuo-well mt-4 rounded-lg px-4 py-3 text-sm leading-relaxed text-[#6C757D]">
              {isWriting ? (
                <>
                  আপনি <b>{wordCount}</b> শব্দ লিখেছেন। জমা দেওয়ার পর
                  ইনস্ট্রাক্টর আপনার লেখা মূল্যায়ন করবেন।
                </>
              ) : (
                <>
                  {questionList.length}টির মধ্যে{" "}
                  <b className="text-emerald-700">{answeredCount}টি</b> উত্তর
                  দিয়েছেন।
                  {answeredCount < questionList.length && (
                    <span className="text-amber-700">
                      {" "}
                      {questionList.length - answeredCount}টি বাকি আছে।
                    </span>
                  )}{" "}
                  জমার পর আর বদলানো যাবে না।
                </>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="skeuo-key flex-1 rounded-lg py-3 text-sm font-bold"
              >
                ফিরে যাই
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="btn-red flex-1 rounded-lg py-3 text-sm font-bold disabled:opacity-60"
              >
                {submitting ? "জমা হচ্ছে…" : "হ্যাঁ, জমা দিন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
