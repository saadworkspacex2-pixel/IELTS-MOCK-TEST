import type { users } from "@/db/schema";

export const PREMIUM_TIERS = ["starter", "plus", "pro"] as const;
export type PremiumTier = (typeof PREMIUM_TIERS)[number];
export type AccessLevel = "free" | "premium";

type UserMembership = Pick<
  typeof users.$inferSelect,
  "membershipTier" | "premiumUntil"
>;

export function isPremiumMember(user: UserMembership | null | undefined) {
  if (!user || !PREMIUM_TIERS.includes(user.membershipTier as PremiumTier)) {
    return false;
  }
  return !user.premiumUntil || user.premiumUntil.getTime() > Date.now();
}

export function canAccessLevel(
  accessLevel: string | null | undefined,
  user: UserMembership | null | undefined,
) {
  return accessLevel !== "premium" || isPremiumMember(user);
}

export function isPremiumTier(value: unknown): value is PremiumTier {
  return typeof value === "string" && PREMIUM_TIERS.includes(value as PremiumTier);
}

export const planLabels: Record<PremiumTier, string> = {
  starter: "Premium Starter",
  plus: "Premium Plus",
  pro: "Premium Pro",
};
