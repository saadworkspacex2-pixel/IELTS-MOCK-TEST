export const LHBD_IELTS_COURSE_MOCK_CATEGORY = "LHBD IELTS Course Mocks";

export function courseMockClassNumber(title: string) {
  const match = title.match(/(?:class|ক্লাস)\s*(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}
