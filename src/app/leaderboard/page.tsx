import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import SpringHeading from "@/components/SpringHeading";
import { db } from "@/db";
import { attempts, exams, users } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicSections from "@/components/DynamicSections";
import Reveal from "@/components/Reveal";
import { formatDateBn, formatDuration, toBn } from "@/lib/bn";
import Link from "next/link";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("leaderboard");
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const { exam: examParam } = await searchParams;
  const examId = examParam ? Number(examParam) : undefined;

  const allExams = await db
    .select()
    .from(exams)
    .orderBy(desc(exams.createdAt));

  const rows = await db
    .select({ attempt: attempts, examTitle: exams.title, membershipTier: users.membershipTier, premiumUntil: users.premiumUntil })
    .from(attempts)
    .innerJoin(exams, eq(attempts.examId, exams.id))
    .leftJoin(users, eq(attempts.userId, users.id))
    .where(examId ? and(eq(attempts.examId, examId), eq(attempts.isPublished, true)) : eq(attempts.isPublished, true))
    .orderBy(desc(attempts.score), desc(attempts.createdAt))
    .limit(50);
  const premiumRows = rows.slice(0, 3);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-6">
        <div className="anim-fade-up text-center">
          <div className=" mx-auto grid h-16 w-16 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-3xl">
            
          </div>
          <SpringHeading as="h1" className="mt-5 text-3xl font-bold sm:text-4xl">
            লিডার<span className="text-[#E51A24]">বোর্ড</span>
          </SpringHeading>
          <p className="mx-auto mt-3 max-w-xl text-[#6C757D]">
            সেরা পরীক্ষার্থীদের তালিকা — আপনার নামও এখানে আনুন!
          </p>
        </div>

        <div className="anim-fade-up delay-200 mt-8 flex flex-wrap justify-center gap-2">
          <Link
            href="/leaderboard"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !examId
                ? "bg-[#E51A24] text-white"
                : "border border-slate-300 text-slate-700 hover:border-red-300"
            }`}
          >
            সব পরীক্ষা
          </Link>
          {allExams.map((e) => (
            <Link
              key={e.id}
              href={`/leaderboard?exam=${e.id}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                examId === e.id
                  ? "bg-[#E51A24] text-white"
                  : "border border-slate-300 text-slate-700 hover:border-red-300"
              }`}
            >
              {e.title}
            </Link>
          ))}
        </div>

        {premiumRows.length > 0 && <section className="mt-10 grid gap-4 sm:grid-cols-3">{premiumRows.map((row, index) => { const premium = ["starter", "plus", "pro"].includes(row.membershipTier || ""); return <article key={row.attempt.id} className={`relative overflow-hidden rounded-2xl border p-5 ${premium ? "border-amber-300 bg-gradient-to-br from-amber-100 via-yellow-50 to-white shadow-[0_12px_28px_rgba(180,120,0,.17)]" : "border-black/[.08] bg-white"}`}><span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold ${index === 0 ? "bg-amber-400 text-white" : index === 1 ? "bg-slate-300 text-slate-700" : "bg-orange-200 text-orange-700"}`}>{toBn(index + 1)}</span>{premium && <span className="absolute right-4 top-5 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold text-amber-950">✦ PREMIUM</span>}<p className="mt-4 truncate font-bold text-[#1A1A1A]">{row.attempt.studentName}</p><p className="mt-1 truncate text-xs text-[#6C757D]">{row.examTitle}</p><p className="mt-4 text-xl font-extrabold text-[#E51A24]">{row.attempt.bandScore !== null ? `Band ${row.attempt.bandScore}` : toBn(row.attempt.score)}</p></article>; })}</section>}

        <div className="mt-6 overflow-hidden rounded-lg border border-black/[0.07]">
          <table className="w-full text-sm">
            <thead className="bg-white text-left text-xs text-[#6C757D]">
              <tr>
                <th className="px-5 py-4">র্যাঙ্ক</th>
                <th className="px-5 py-4">নাম</th>
                <th className="hidden px-5 py-4 sm:table-cell">পরীক্ষা</th>
                <th className="px-5 py-4 text-right">স্কোর</th>
                <th className="hidden px-5 py-4 text-right md:table-cell">
                  সময়
                </th>
                <th className="hidden px-5 py-4 text-right md:table-cell">
                  তারিখ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((r, i) => {
                const premium = ["starter", "plus", "pro"].includes(r.membershipTier || "");
                return (
                <tr
                  key={r.attempt.id}
                  className={`transition-colors hover:bg-slate-50 ${premium ? "bg-amber-50/55" : ""}`}
                >
                  <td className="px-5 py-4">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                        i === 0
                          ? "bg-amber-100 text-amber-600"
                          : i === 1
                            ? "bg-slate-200 text-slate-700"
                            : i === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-slate-100 text-[#6C757D]"
                      }`}
                    >
                      {toBn(i + 1)}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold">
                    <span className="inline-flex items-center gap-2">{r.attempt.studentName}{premium && <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-extrabold text-amber-950">✦ PREMIUM</span>}</span>
                  </td>
                  <td className="hidden px-5 py-4 text-[#6C757D] sm:table-cell">
                    {r.examTitle}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-[#E51A24]">
                    {r.attempt.bandScore !== null ? (
                      <>
                        ব্যান্ড{" "}
                        {r.attempt.bandScore % 1 === 0
                          ? `${toBn(r.attempt.bandScore)}.০`
                          : toBn(r.attempt.bandScore)}
                      </>
                    ) : (
                      toBn(r.attempt.score)
                    )}
                  </td>
                  <td className="hidden px-5 py-4 text-right text-[#6C757D] md:table-cell">
                    {formatDuration(r.attempt.timeTakenSeconds)}
                  </td>
                  <td className="hidden px-5 py-4 text-right text-slate-500 md:table-cell">
                    {formatDateBn(r.attempt.createdAt)}
                  </td>
                </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-[#6C757D]"
                  >
                    এখনও কোনো ফলাফল নেই — প্রথম হওয়ার সুযোগ আপনার!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Reveal className="mt-10 text-center">
          <Link
            href="/exams"
            className="inline-block rounded-md btn-red px-7 py-3.5 font-semibold text-white transition"
          >
            এখনই পরীক্ষা দিন →
          </Link>
        </Reveal>
      </main>
      <DynamicSections page="leaderboard" />
      <Footer />
    </div>
  );
}
