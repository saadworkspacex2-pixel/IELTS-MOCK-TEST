import { db } from "@/db";
import { attempts, exams } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type ModuleStat = {
  module: string;
  label: string;
  attempts: number;
  bestBand: number | null;
  avgPercent: number;
};

// Explicit columns keep the profile independent from leaderboard-only schema additions.
export async function getProfileData(userId: number) {
  const rows = await db
    .select({
      attempt: {
        id: attempts.id,
        studentName: attempts.studentName,
        score: attempts.score,
        bandScore: attempts.bandScore,
        correctCount: attempts.correctCount,
        wrongCount: attempts.wrongCount,
        skippedCount: attempts.skippedCount,
        totalQuestions: attempts.totalQuestions,
        timeTakenSeconds: attempts.timeTakenSeconds,
        status: attempts.status,
        ip: attempts.ip,
        createdAt: attempts.createdAt,
      },
      exam: { id: exams.id, title: exams.title, module: exams.module },
    })
    .from(attempts)
    .innerJoin(exams, eq(attempts.examId, exams.id))
    .where(eq(attempts.userId, userId))
    .orderBy(desc(attempts.createdAt))
    .limit(100);

  const mods: Record<string, { label: string; rows: typeof rows }> = {
    reading: { label: "Reading", rows: [] },
    listening: { label: "Listening", rows: [] },
    writing: { label: "Writing", rows: [] },
    mcq: { label: "Grammar/MCQ", rows: [] },
  };
  for (const row of rows) (mods[row.exam.module] ?? mods.mcq).rows.push(row);

  const moduleStats: ModuleStat[] = Object.entries(mods).map(([module, value]) => {
    const scored = value.rows.filter((row) => row.attempt.status === "scored");
    const bands = scored.map((row) => row.attempt.bandScore).filter((band): band is number => band !== null);
    const percents = scored.filter((row) => row.attempt.totalQuestions > 0).map((row) => (row.attempt.correctCount / Math.max(1, row.attempt.totalQuestions)) * 100);
    return {
      module,
      label: value.label,
      attempts: value.rows.length,
      bestBand: bands.length ? Math.max(...bands) : null,
      avgPercent: percents.length ? Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length) : 0,
    };
  });

  const scoredAll = rows.filter((row) => row.attempt.status === "scored" && row.attempt.totalQuestions > 0);
  const overallPercent = scoredAll.length
    ? Math.round(scoredAll.reduce((sum, row) => sum + (row.attempt.correctCount / Math.max(1, row.attempt.totalQuestions)) * 100, 0) / scoredAll.length)
    : 0;
  const allBands = rows.map((row) => row.attempt.bandScore).filter((band): band is number => band !== null);
  const overallBand = allBands.length ? Math.round((allBands.reduce((sum, value) => sum + value, 0) / allBands.length) * 2) / 2 : null;
  const progress = [...scoredAll].reverse().slice(-12).map((row) => ({
    label: row.exam.title,
    percent: Math.round((row.attempt.correctCount / Math.max(1, row.attempt.totalQuestions)) * 100),
    band: row.attempt.bandScore,
    date: row.attempt.createdAt,
  }));

  return { rows, moduleStats, overallPercent, overallBand, progress };
}
