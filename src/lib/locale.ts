import { cookies } from "next/headers";

export const LOCALE_COOKIE = "lhbd_locale";
export type AppLocale = "bn" | "en";

export function normalizeLocale(value: unknown): AppLocale {
  return value === "en" ? "en" : "bn";
}

export async function getLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}
