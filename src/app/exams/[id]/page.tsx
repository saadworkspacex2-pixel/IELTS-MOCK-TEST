import type { Metadata } from "next";
import SpringHeading from "@/components/SpringHeading";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { attempts, exams, questions, sections } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartExamCard from "./StartExamCard";
import { toBn } from "@/lib/bn";
import { currentUser } from "@/lib/userAuth";
import { canAccessLevel } from "@/lib/premium";
import PremiumGate from "@/components/PremiumGate";
import { LHBD_IELTS_COURSE_MOCK_CATEGORY } from "@/lib/courseMocks";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [exam] = await db.select({ title: exams.title, description: exams.description }).from(exams).where(eq(exams.id, Number(id)));
  if (!exam) return { title: "টেস্ট পাওয়া যায়নি" };
  return { title: exam.title, description: exam.description || `${exam.title} — IELTS Mock Test-এ অনুশীলন করুন।` };
}

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const examId = Number(id);
  if (!Number.isFinite(examId)) notFound();

  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) notFound();
  const user = await currentUser();
  const hasAccess = canAccessLevel(exam.accessLevel, user);

  const [[qCount], [secCount], topAttempts] = await Promise.all([
    db
      .select({ c: count() })
      .from(questions)
      .where(eq(questions.examId, examId)),
    db
      .select({ c: count() })
      .from(sections)
      .where(eq(sections.examId, examId)),
    db
      .select()
      .from(attempts)
      .where(eq(attempts.examId, examId))
      .orderBy(desc(attempts.score), desc(attempts.createdAt))
      .limit(5),
  ]);

  const totalMarks = qCount.c * exam.marksPerQuestion;
  const isCourseMock = exam.category === LHBD_IELTS_COURSE_MOCK_CATEGORY;
  const isWriting = exam.module === "writing";
  const isReading =
    exam.module === "reading" || exam.module === "listening";
  const moduleBadge = isWriting
    ? "Writing"
    : exam.module === "listening"
      ? "Listening"
      : isReading
        ? "Reading"
        : "MCQ";

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-6">
        <div className="anim-fade-up">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {exam.category}
          </span>
          <span className="ml-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-[#E51A24]">
            {moduleBadge}
          </span>
          {exam.accessLevel === "premium" && <span className="ml-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">✦ PREMIUM</span>}
          <SpringHeading as="h1" className="mt-4 text-3xl font-bold sm:text-4xl">{exam.title}</SpringHeading>
          {exam.description && (
            <p className="mt-3 max-w-2xl leading-relaxed text-[#6C757D]">
              {exam.description}
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="anim-fade-up delay-100 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(isCourseMock
                ? [
                    { label: isWriting ? "কোর্স টাস্ক" : "উৎস অনুশীলন", value: isWriting ? toBn(secCount.c) : toBn(qCount.c) },
                    { label: "সময়", value: `${toBn(exam.durationMinutes)} মি` },
                    { label: exam.module === "listening" ? "অডিও" : "উৎস", value: exam.module === "listening" ? "দেওয়া নেই" : "কোর্স বই" },
                    { label: "ফলাফল", value: "রিভিউর পর" },
                  ]
                : isWriting
                  ? [
                      { label: "টাস্ক", value: toBn(secCount.c) },
                      { label: "সময়", value: `${toBn(exam.durationMinutes)} মি` },
                      { label: "মার্কিং", value: "ইনস্ট্রাক্টর" },
                      { label: "ফলাফল", value: "রিভিউর পর" },
                    ]
                  : isReading
                    ? [
                        { label: "মোট প্রশ্ন", value: toBn(qCount.c) },
                        { label: "সময়", value: `${toBn(exam.durationMinutes)} মি` },
                        { label: exam.module === "listening" ? "সেকশন" : "প্যাসেজ", value: toBn(secCount.c) },
                        { label: "স্কোর", value: "ব্যান্ড" },
                      ]
                    : [
                        { label: "মোট প্রশ্ন", value: toBn(qCount.c) },
                        { label: "সময়", value: `${toBn(exam.durationMinutes)} মি` },
                        { label: "পূর্ণমান", value: toBn(totalMarks) },
                        {
                          label: "নেগেটিভ মার্ক",
                          value: `-${toBn(exam.negativeMark)}`,
                        },
                      ]
              ).map((s) => (
                <div
                  key={s.label}
                  className="card rounded-xl p-5 text-center"
                >
                  <div className="skeuo-well mx-auto inline-block rounded px-3 py-0.5 text-xl font-bold text-[#E51A24]">
                    {s.value}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[#6C757D]">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="anim-fade-up delay-200 rounded-lg border border-black/[0.07] card p-7">
              <SpringHeading as="h2" className="text-lg font-semibold">টেস্টের নিয়মাবলি</SpringHeading>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#6C757D]">
                {isCourseMock ? (
                  <>
                    <li className="flex gap-3"><span className="text-[#E51A24]">1</span> এই ক্লাসে দেওয়া course-book-এর মূল passage, prompt ও প্রশ্নের ভাষা সংরক্ষিত আছে।</li>
                    <li className="flex gap-3"><span className="text-slate-600">◉</span> ডাউনলোড করা উৎসে machine-readable answer key নেই; তাই উত্তর auto-score না হয়ে রিভিউর জন্য জমা হবে।</li>
                    {exam.module === "listening" ? (
                      <li className="flex gap-3"><span className="text-amber-600">▶</span> দেওয়া বই/ডকুমেন্টে playable Listening audio ছিল না এবং মূল QR audio link-ও আর সক্রিয় নয়। কোনো বিকল্প audio যোগ করা হয়নি।</li>
                    ) : (
                      <li className="flex gap-3"><span className="text-slate-600">↔</span> প্রশ্ন ও task visual যেখানে উৎসে ছিল, সেগুলো class order অনুযায়ী এই অনুশীলনে রাখা হয়েছে।</li>
                    )}
                    <li className="flex gap-3"><span className="text-[#E51A24]">★</span> সব LHBD Course Mock সবার জন্য Free।</li>
                  </>
                ) : isWriting ? (
                  <>
                    <li className="flex gap-3">
                      <span className="text-[#E51A24]">1</span> Task 1-এর জন্য প্রায় ২০ মিনিটে কমপক্ষে ১৫০ শব্দ এবং Task 2-এর জন্য প্রায় ৪০ মিনিটে কমপক্ষে ২৫০ শব্দ লিখুন।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-slate-600">↔</span> স্ক্রিনের বাঁ পাশে task prompt, ডান পাশে আলাদা লেখার জায়গা ও প্রতিটি task-এর live word count থাকবে।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-slate-600"></span> সময় শেষ হলে লেখা
                      স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-amber-600"></span> ইনস্ট্রাক্টর
                      আপনার লেখা পড়ে মূল্যায়ন করবেন — শুধু নম্বর নয়, কারণসহ।
                    </li>
                  </>
                ) : exam.module === "listening" ? (
                  <>
                    <li className="flex gap-3"><span className="text-[#E51A24]">▶</span> চারটি Listening section ও ৪০টি প্রশ্ন আছে। Audio একবার, স্বাভাবিক গতিতে চালানো যাবে।</li>
                    <li className="flex gap-3"><span className="text-slate-600">◉</span> Test চলাকালে transcript দেখা যাবে না; প্রশ্নের সঙ্গে শুনে উত্তর দিন।</li>
                    <li className="flex gap-3"><span className="text-slate-600">⌨</span> Form completion-এ NO MORE THAN THREE WORDS AND/OR A NUMBER নির্দেশনা মেনে উত্তর লিখুন।</li>
                    <li className="flex gap-3"><span className="text-[#E51A24]">★</span> শেষ হলে raw score থেকে আনুমানিক band score দেখানো হবে।</li>
                  </>
                ) : isReading ? (
                  <>
                    <li className="flex gap-3"><span className="text-[#E51A24]">↔</span> কম্পিউটার-ডেলিভার্ড reading-style screen — বাঁয়ে passage, ডানে প্রশ্ন এবং একটি ৬০ মিনিটের ঘড়ি।</li>
                    <li className="flex gap-3"><span className="text-slate-600">⌕</span> তিনটি passage জুড়ে MCQ, True/False/Not Given এবং typed gap-fill প্রশ্ন আছে।</li>
                    <li className="flex gap-3"><span className="text-slate-600">⚑</span> Question palette দিয়ে যেকোনো প্রশ্নে যান এবং review flag দিন।</li>
                    <li className="flex gap-3"><span className="text-[#E51A24]">★</span> জমা দেওয়ার সঙ্গে সঙ্গেই raw score থেকে আনুমানিক band score দেখানো হবে।</li>
                  </>
                ) : (
                  <>
                    <li className="flex gap-3">
                      <span className="text-[#E51A24]"></span> প্রতিটি সঠিক
                      উত্তরে {toBn(exam.marksPerQuestion)} নম্বর পাবেন।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-rose-600"></span> প্রতিটি ভুল
                      উত্তরে {toBn(exam.negativeMark)} নম্বর কাটা যাবে। স্কিপ
                      করলে কাটা যাবে না।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-slate-600"></span> সময় শেষ হলে
                      পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#E51A24]"></span> জমা দেওয়ার
                      সঙ্গে সঙ্গেই ফলাফল, ব্যাখ্যাসহ উত্তর ও র্যাঙ্ক।
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="anim-fade-up delay-300 rounded-lg border border-black/[0.07] card p-7">
              <SpringHeading as="h2" className="text-lg font-semibold">
                এই পরীক্ষার সেরা ফলাফল
              </SpringHeading>
              {topAttempts.length === 0 ? (
                <p className="mt-4 text-sm text-[#6C757D]">
                  এখনও কেউ পরীক্ষা দেয়নি — আপনিই প্রথম হোন!
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {topAttempts.map((a, i) => (
                    <div
                      key={a.id}
                      className="skeuo-well flex items-center justify-between rounded-lg px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span className="skeuo-key grid h-7 w-7 place-items-center rounded-full text-xs font-bold">
                          {toBn(i + 1)}
                        </span>
                        <span className="font-medium">{a.studentName}</span>
                      </span>
                      <span className="font-bold text-[#E51A24]">
                        {toBn(a.score)} / {toBn(a.totalQuestions * exam.marksPerQuestion)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="anim-fade-up delay-200">
            {hasAccess ? (
              <StartExamCard
                examId={exam.id}
                hasQuestions={isWriting ? secCount.c > 0 : qCount.c > 0}
                durationMinutes={exam.durationMinutes}
              />
            ) : (
              <PremiumGate title="এই টেস্টটি Premium" description="টেস্ট শুরু করতে একটি Premium প্ল্যান নির্বাচন করুন। পেমেন্ট রিকোয়েস্ট যাচাইয়ের পর অ্যাক্সেস চালু হবে।" />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
