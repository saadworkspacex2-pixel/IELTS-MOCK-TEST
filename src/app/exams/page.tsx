import SpringHeading from "@/components/SpringHeading";
import Link from "next/link";
import { db } from "@/db";
import { exams, questions } from "@/db/schema";
import { asc, count, desc, eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicSections from "@/components/DynamicSections";
import Reveal from "@/components/Reveal";
import { toBn } from "@/lib/bn";
import { currentUser } from "@/lib/userAuth";
import { canAccessLevel } from "@/lib/premium";
import LockedPremiumExamCard from "@/components/LockedPremiumExamCard";
import { courseMockClassNumber, LHBD_IELTS_COURSE_MOCK_CATEGORY } from "@/lib/courseMocks";

export const dynamic = "force-dynamic";

type ExamRow = {
  exam: typeof exams.$inferSelect;
  questionCount: number;
};

function moduleLabel(module: string) {
  return module === "reading"
    ? "Reading"
    : module === "listening"
      ? "Listening"
      : module === "writing"
        ? "Writing"
        : "MCQ";
}

function ExamCards({ rows, user, course = false }: { rows: ExamRow[]; user: Awaited<ReturnType<typeof currentUser>>; course?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
      {rows.map((row, index) => {
        const { exam, questionCount } = row;
        const label = moduleLabel(exam.module);
        const isLockedPremium = exam.accessLevel === "premium" && !canAccessLevel(exam.accessLevel, user);
        const classNumber = course ? courseMockClassNumber(exam.title) : Number.MAX_SAFE_INTEGER;

        return (
          <Reveal key={exam.id} delay={(index % 3) * 80}>
            {isLockedPremium ? (
              <LockedPremiumExamCard
                id={exam.id}
                category={exam.category}
                title={exam.title}
                description={exam.description}
                questionValue={exam.module === "writing" ? "টাস্ক" : toBn(questionCount)}
                questionLabel={exam.module === "writing" ? "রাইটিং" : "প্রশ্ন"}
                durationValue={`${toBn(exam.durationMinutes)} মি`}
                moduleValue={exam.module === "listening" ? "অডিও" : "স্ক্রিন"}
                moduleLabel={label}
              />
            ) : (
              <Link href={`/exams/${exam.id}`} className="lift card group block h-full rounded-xl p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="skeuo-well rounded-full px-3 py-1 text-xs font-semibold text-[#6C757D]">
                    {course && Number.isFinite(classNumber) ? `Class ${toBn(classNumber)} · ${label} Mock` : exam.category}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {exam.accessLevel === "premium" && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">PREMIUM</span>}
                    <span className="status-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold">
                      <span className="anim-pulse-live h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      LIVE
                    </span>
                  </div>
                </div>
                <SpringHeading as="h2" className="mt-4 text-lg font-semibold transition-colors group-hover:text-[#E51A24]">
                  {exam.title}
                </SpringHeading>
                <p className="mt-2 line-clamp-2 text-sm text-[#6C757D]">{exam.description}</p>
                <div className="skeuo-well mt-5 grid grid-cols-3 gap-2 rounded-lg p-3 text-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{exam.module === "writing" ? "টাস্ক" : toBn(questionCount)}</div>
                    <div className="text-slate-500">{exam.module === "writing" ? "রাইটিং" : "প্রশ্ন"}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{toBn(exam.durationMinutes)} মি</div>
                    <div className="text-slate-500">সময়</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-600">{exam.module === "listening" ? "অডিও" : "স্ক্রিন"}</div>
                    <div className="text-slate-500">{label}</div>
                  </div>
                </div>
              </Link>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const user = await currentUser();

  const rows = await db
    .select({ exam: exams, questionCount: count(questions.id) })
    .from(exams)
    .leftJoin(questions, eq(questions.examId, exams.id))
    .where(eq(exams.isLive, true))
    .groupBy(exams.id)
    .orderBy(asc(exams.sortOrder), desc(exams.createdAt));

  const categories = Array.from(new Set([...rows.map((row) => row.exam.category), LHBD_IELTS_COURSE_MOCK_CATEGORY]));
  const filtered = category ? rows.filter((row) => row.exam.category === category) : rows;
  const courseRows = filtered
    .filter((row) => row.exam.category === LHBD_IELTS_COURSE_MOCK_CATEGORY)
    .sort((a, b) => courseMockClassNumber(a.exam.title) - courseMockClassNumber(b.exam.title) || a.exam.sortOrder - b.exam.sortOrder);
  const standardRows = filtered.filter((row) => row.exam.category !== LHBD_IELTS_COURSE_MOCK_CATEGORY);
  const showingCourse = !category || category === LHBD_IELTS_COURSE_MOCK_CATEGORY;

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
        <div className="anim-fade-up">
          <SpringHeading as="h1" className="text-3xl font-bold sm:text-4xl">
            লাইভ <span className="text-[#E51A24]">পরীক্ষাসমূহ</span>
          </SpringHeading>
          <p className="mt-3 max-w-2xl text-[#6C757D]">
            পছন্দের বিষয় বেছে নিয়ে এখনই মক টেস্ট শুরু করুন। প্রতিটি পরীক্ষায় টাইমার, নেগেটিভ মার্কিং ও সঙ্গে সঙ্গে ফলাফল।
          </p>
        </div>

        <div data-tour="exams-filters" className="anim-fade-up delay-200 mt-8 flex flex-wrap gap-2">
          <Link href="/exams" className={`rounded-full px-4 py-2 text-sm font-semibold ${!category ? "btn-red" : "skeuo-key"}`}>
            সব ({toBn(rows.length)})
          </Link>
          {categories.map((item) => (
            <Link
              key={item}
              href={`/exams?category=${encodeURIComponent(item)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${category === item ? "btn-red" : "skeuo-key"}`}
            >
              {item}
            </Link>
          ))}
        </div>

        {showingCourse && (
          <section id="lhbd-ielts-course-mocks" className="anim-fade-up delay-100 mt-12 rounded-2xl border border-[#E51A24]/20 bg-gradient-to-br from-white/92 via-red-50/70 to-white/92 p-5 shadow-[0_14px_36px_rgba(125,13,24,.09)] sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full border border-[#E51A24]/15 bg-white px-3 py-1 text-[11px] font-extrabold tracking-[0.12em] text-[#B50C16]">COURSE LIBRARY</span>
                <SpringHeading as="h2" className="mt-3 text-2xl font-bold text-[#1A1A1A] sm:text-3xl">LHBD IELTS Course Mocks</SpringHeading>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6C757D]">কোর্স বইয়ের ক্লাসভিত্তিক Reading, Listening ও Writing mock এখানে Class নম্বর অনুযায়ী সাজানো থাকবে। সব Course Mock সবার জন্য ফ্রি।</p>
              </div>
              <span className="rounded-full bg-[#E51A24]/[0.08] px-3 py-1.5 text-xs font-bold text-[#B50C16]">{toBn(courseRows.length)}টি Course Mock</span>
            </div>

            {courseRows.length > 0 ? (
              <div className="mt-7"><ExamCards rows={courseRows} user={user} course /></div>
            ) : (
              <div className="mt-7 rounded-xl border border-dashed border-red-200 bg-white/75 px-5 py-10 text-center text-sm text-[#6C757D]">
                এখনও কোনো LHBD IELTS Course Mock যোগ করা হয়নি। বই থেকে Class অনুযায়ী Mock যোগ হলে এখানে দেখা যাবে।
              </div>
            )}
          </section>
        )}

        {standardRows.length > 0 && (
          <section data-tour="exams-grid" className={`${showingCourse ? "mt-12" : "mt-10"}`}>
            {showingCourse && <SpringHeading as="h2" className="mb-5 text-xl font-bold text-[#1A1A1A]">অন্যান্য লাইভ পরীক্ষা</SpringHeading>}
            <ExamCards rows={standardRows} user={user} />
          </section>
        )}

        {filtered.length === 0 && !showingCourse && (
          <p className="py-20 text-center text-[#6C757D]">কোনো পরীক্ষা পাওয়া যায়নি।</p>
        )}
      </main>
      <DynamicSections page="exams" />
      <Footer />
    </div>
  );
}
