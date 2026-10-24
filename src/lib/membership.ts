import { randomBytes } from "node:crypto";
import type { PremiumTier } from "@/lib/premium";

const BENGALI_DIGITS: Record<string, string> = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };

export function durationDays(value: string | undefined) {
  const normalized = (value || "").replace(/[০-৯]/g, (digit) => BENGALI_DIGITS[digit] ?? digit);
  const amount = Number(normalized.match(/\d+/)?.[0] ?? 0);
  return Number.isFinite(amount) && amount > 0 ? Math.min(amount, 3650) : 0;
}

export function membershipExpiry(duration: string | undefined) {
  const days = durationDays(duration);
  if (!days) return null;
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires;
}

export function receiptIdentity(paymentId: number) {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  const token = randomBytes(16).toString("hex").toUpperCase();
  return {
    receiptCode: `LHBD-${new Date().getFullYear()}-${String(paymentId).padStart(6, "0")}-${suffix}`,
    receiptToken: `VER-${token}`,
  };
}

export function tierSettings(tier: PremiumTier, settings: Record<string, string>) {
  const name = settings[`premium_${tier}_name`] || `Premium ${tier.charAt(0).toUpperCase()}${tier.slice(1)}`;
  const price = settings[`premium_${tier}_price`] || "";
  const duration = settings[`premium_${tier}_duration`] || "";
  return { name, price, duration, expiresAt: membershipExpiry(duration) };
}
