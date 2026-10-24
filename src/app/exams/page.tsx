import SpringHeading from "@/components/SpringHeading";
import Link from "next/link";
import { db } from "@/db";
import { exams, questions } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicSections from "@/components/DynamicSections";
import Reveal from "@/components/Reveal";
import { toBn } from "@/lib/bn";
import { currentUser } from "@/lib/userAuth";
import { canAccessLevel } from "@/lib/premium";

export const dynamic = "force-dynamic";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const user = await currentUser();

  const rows = await db
    .select({
      exam: exams,
      questionCount: count(questions.id),
    })
    .from(exams)
    .leftJoin(questions, eq(questions.examId, exams.id))
    .where(eq(exams.isLive, true))
    .groupBy(exams.id)
    .orderBy(desc(exams.createdAt));

  const categories = Array.from(new Set(rows.map((r) => r.exam.category)));
  const filtered = category
    ? rows.filter((r) => r.exam.category === category)
    : rows;

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6">
        <div className="anim-fade-up">
          <SpringHeading as="h1" className="text-3xl font-bold sm:text-4xl">
            লাইভ <span className="text-[#E51A24]">পরীক্ষাসমূহ</span>
          </SpringHeading>
          <p className="mt-3 max-w-2xl text-[#6C757D]">
            পছন্দের বিষয় বেছে নিয়ে এখনই মক টেস্ট শুরু করুন। প্রতিটি পরীক্ষায়
            টাইমার, নেগেটিভ মার্কিং ও সঙ্গে সঙ্গে ফলাফল।
          </p>
        </div>

        <div data-tour="exams-filters" className="anim-fade-up delay-200 mt-8 flex flex-wrap gap-2">
          <Link
            href="/exams"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              !category ? "btn-red" : "skeuo-key"
            }`}
          >
            সব ({toBn(rows.length)})
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/exams?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                category === c ? "btn-red" : "skeuo-key"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <div data-tour="exams-grid" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filtered.map((r, i) => (
            <Reveal key={r.exam.id} delay={(i % 3) * 80}>
              <Link
                href={`/exams/${r.exam.id}`}
                className="lift card group block h-full rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="skeuo-well rounded-full px-3 py-1 text-xs font-semibold text-[#6C757D]">
                    {r.exam.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {r.exam.accessLevel === "premium" && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">✦ PREMIUM</span>}
                    <span className="status-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold">
                      <span className="anim-pulse-live h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      LIVE
                    </span>
                  </div>
                </div>
                <SpringHeading as="h2" className="mt-4 text-lg font-semibold transition-colors group-hover:text-[#E51A24]">
                  {r.exam.title}
                </SpringHeading>
                <p className="mt-2 line-clamp-2 text-sm text-[#6C757D]">
                  {r.exam.description}
                </p>
                {r.exam.accessLevel === "premium" && !canAccessLevel(r.exam.accessLevel, user) && <p className="mt-2 text-xs font-semibold text-amber-700">প্রিমিয়াম অ্যাক্সেস প্রয়োজন</p>}
                <div className="skeuo-well mt-5 grid grid-cols-3 gap-2 rounded-lg p-3 text-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">
                      {r.exam.module === "writing"
                        ? "টাস্ক"
                        : toBn(r.questionCount)}
                    </div>
                    <div className="text-slate-500">
                      {r.exam.module === "writing" ? "রাইটিং" : "প্রশ্ন"}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">
                      {toBn(r.exam.durationMinutes)} মি
                    </div>
                    <div className="text-slate-500">সময়</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-600">
                      {r.exam.module === "listening" ? "অডিও" : "স্ক্রিন"}
                    </div>
                    <div className="text-slate-500">
                      {r.exam.module === "reading"
                        ? "Reading"
                        : r.exam.module === "listening"
                          ? "Listening"
                          : r.exam.module === "writing"
                            ? "Writing"
                            : "MCQ"}
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-20 text-center text-[#6C757D]">
              কোনো পরীক্ষা পাওয়া যায়নি।
            </p>
          )}
        </div>
      </main>
      <DynamicSections page="exams" />
      <Footer />
    </div>
  );
}
