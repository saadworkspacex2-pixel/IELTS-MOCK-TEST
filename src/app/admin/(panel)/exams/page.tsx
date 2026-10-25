"use client";

import SpringHeading from "@/components/SpringHeading";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toBn } from "@/components/CountUp";
import Icon from "@/components/Icon";
import BulkTools from "./BulkTools";

type Exam = {
  id: number;
  title: string;
  category: string;
  durationMinutes: number;
  negativeMark: number;
  isLive: boolean;
  sortOrder: number;
  accessLevel: "free" | "premium";
  createdAt: string;
};

export default function AdminExamsPage() {
  const [rows, setRows] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [draggingExamId, setDraggingExamId] = useState<number | null>(null);
  const [dropExamId, setDropExamId] = useState<number | null>(null);
  const [orderError, setOrderError] = useState("");
  const [orderNotice, setOrderNotice] = useState("");

  const load = () =>
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => setRows(d))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const toggleLive = async (e: Exam) => {
    setBusy(e.id);
    await fetch(`/api/exams/${e.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLive: !e.isLive }),
    });
    await load();
    setBusy(null);
  };

  const remove = async (e: Exam) => {
    if (
      !confirm(
        `"${e.title}" মুছে ফেলবেন? এর সব প্রশ্ন ও ফলাফলও মুছে যাবে।`,
      )
    )
      return;
    setBusy(e.id);
    await fetch(`/api/exams/${e.id}`, { method: "DELETE" });
    await load();
    setBusy(null);
  };

  const orderedRows = (source: Exam[]) =>
    [...source].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const moveExam = async (examId: number, requestedIndex: number) => {
    if (ordering) return;
    const ordered = orderedRows(rows);
    const currentIndex = ordered.findIndex((exam) => exam.id === examId);
    const moving = ordered[currentIndex];
    if (!moving) return;
    const without = ordered.filter((exam) => exam.id !== examId);
    const insertAt = Math.max(0, Math.min(requestedIndex, without.length));
    const hasNormalOrder = ordered.every((exam, index) => exam.sortOrder === index + 1);
    if (currentIndex === insertAt && hasNormalOrder) return;
    const next = [
      ...without.slice(0, insertAt),
      moving,
      ...without.slice(insertAt),
    ].map((exam, index) => ({ ...exam, sortOrder: index + 1 }));

    setOrdering(true);
    setOrderError("");
    setOrderNotice("");
    setRows(next);
    try {
      const res = await fetch("/api/exams/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: next.map((exam) => ({ id: exam.id, sortOrder: exam.sortOrder })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Mock পরীক্ষার ক্রম সংরক্ষণ ব্যর্থ হয়েছে");
      setRows(data.exams ?? next);
      setOrderNotice("Mock পরীক্ষার ক্রম সংরক্ষিত হয়েছে");
    } catch (caught) {
      setOrderError(caught instanceof Error ? caught.message : "Mock পরীক্ষার ক্রম সংরক্ষণ ব্যর্থ হয়েছে");
      await load();
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div>
      <div className="anim-fade-up flex flex-wrap items-center justify-between gap-4">
        <div>
          <SpringHeading as="h1" className="text-2xl font-bold">পরীক্ষা ম্যানেজ</SpringHeading>
          <p className="mt-1 text-sm text-[#6C757D]">
            Mock পরীক্ষা তৈরি, ক্রম সাজানো, সম্পাদনা, লাইভ/অফ ও প্রশ্ন ব্যবস্থাপনা
          </p>
        </div>
        <Link
          href="/admin/exams/new"
          data-tour="admin-new-exam-btn"
          className="rounded-md btn-red px-5 py-2.5 text-sm font-bold text-white transition"
        >
          + নতুন পরীক্ষা
        </Link>
      </div>

      <div data-tour="admin-bulk-tools" className="mt-6">
        <BulkTools exams={rows} onDone={load} />
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card rounded-lg p-5">
              <div className="shimmer h-4 w-1/2 rounded" />
              <div className="shimmer mt-2.5 h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div data-tour="admin-exams-table" className="anim-fade-up delay-100 mt-8 overflow-hidden rounded-lg border border-black/[0.07]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.07] bg-red-50/55 px-5 py-3">
            <p className="text-xs font-semibold text-[#7B1A21]">ক্রম নম্বর লিখুন অথবা সারি ধরে টেনে অন্য Mock পরীক্ষার আগে ছেড়ে দিন। এই ক্রমই public পরীক্ষার পাতায় দেখাবে।</p>
            {orderNotice && <span className="text-xs font-bold text-emerald-700">{orderNotice}</span>}
            {orderError && <span className="text-xs font-bold text-rose-600">{orderError}</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="bg-white text-left text-xs text-[#6C757D]">
                <tr>
                  <th className="w-24 px-4 py-3.5 text-center">ক্রম</th>
                  <th className="px-5 py-3.5">পরীক্ষা</th>
                  <th className="px-5 py-3.5">বিভাগ</th>
                  <th className="px-5 py-3.5 text-right">সময়</th>
                  <th className="px-5 py-3.5 text-center">স্ট্যাটাস</th>
                  <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {orderedRows(rows).map((e, index) => (
                  <tr
                    key={e.id}
                    draggable={!ordering}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(e.id));
                      setDraggingExamId(e.id);
                      setDropExamId(null);
                    }}
                    onDragEnd={() => {
                      setDraggingExamId(null);
                      setDropExamId(null);
                    }}
                    onDragOver={(event) => {
                      if (!draggingExamId || draggingExamId === e.id) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDropExamId(e.id);
                    }}
                    onDragLeave={() => setDropExamId((id) => id === e.id ? null : id)}
                    onDrop={(event) => {
                      event.preventDefault();
                      const transferredId = Number(event.dataTransfer.getData("text/plain"));
                      const sourceId = Number.isInteger(transferredId) && transferredId > 0 ? transferredId : draggingExamId;
                      setDraggingExamId(null);
                      setDropExamId(null);
                      if (sourceId && sourceId !== e.id) {
                        const sourceIndex = orderedRows(rows).findIndex((exam) => exam.id === sourceId);
                        // A drop target means "before this row". Once a row is
                        // removed from above the target, its insertion index shifts left.
                        const insertBefore = sourceIndex >= 0 && sourceIndex < index ? index - 1 : index;
                        moveExam(sourceId, insertBefore);
                      }
                    }}
                    className={`cursor-grab transition active:cursor-grabbing ${draggingExamId === e.id ? "opacity-45" : "hover:bg-slate-50"} ${dropExamId === e.id ? "bg-red-50 ring-2 ring-inset ring-[#E51A24]" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-slate-400" title="ধরে টেনে ক্রম সাজান"><Icon name="grip" size={15} /></span>
                        <input
                          key={`${e.id}-${index}`}
                          type="number"
                          min={1}
                          max={rows.length}
                          defaultValue={index + 1}
                          disabled={ordering}
                          onBlur={(event) => {
                            const position = Math.trunc(Number(event.currentTarget.value));
                            if (!Number.isFinite(position)) {
                              event.currentTarget.value = String(index + 1);
                              return;
                            }
                            const targetIndex = Math.max(0, Math.min(position - 1, rows.length - 1));
                            if (targetIndex === index) event.currentTarget.value = String(index + 1);
                            moveExam(e.id, targetIndex);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                          }}
                          aria-label={`${e.title} এর ক্রম`}
                          className="w-11 rounded-md border border-slate-300 bg-white px-1 py-1.5 text-center text-xs font-bold outline-none focus:border-[#E51A24] focus:ring-2 focus:ring-red-100 disabled:opacity-50"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium">{e.title}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{e.category}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-[#6C757D]">{toBn(e.durationMinutes)} মি</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleLive(e)}
                        disabled={busy === e.id || ordering}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          e.isLive
                            ? "bg-red-50 text-[#E51A24] hover:bg-red-100"
                            : "bg-slate-200 text-[#6C757D] hover:bg-slate-200"
                        }`}
                      >
                        {e.isLive ? "● লাইভ" : "○ অফ"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/exams/${e.id}`}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-200"
                        >
                          সম্পাদনা
                        </Link>
                        <button
                          onClick={() => remove(e)}
                          disabled={busy === e.id || ordering}
                          className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          মুছুন
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-[#6C757D]">
                      কোনো পরীক্ষা নেই —{" "}
                      <Link href="/admin/exams/new" className="text-[#E51A24] hover:underline">প্রথম পরীক্ষাটি তৈরি করুন</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
