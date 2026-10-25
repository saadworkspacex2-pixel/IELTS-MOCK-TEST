export type ExamRules = {
  antiCheat?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showExplanations?: boolean;
  hideResults?: boolean;
  // Source imports without supplied answer keys stay review-only instead of receiving invented scores.
  reviewRequired?: boolean;
  sectionTimeMinutes?: number;
};

export function rulesOf(value: unknown): ExamRules {
  if (value && typeof value === "object") return value as ExamRules;
  return {};
}
