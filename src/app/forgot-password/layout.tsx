import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "পাসওয়ার্ড রিসেট", description: "IELTS Mock Test অ্যাকাউন্টের পাসওয়ার্ড OTP দিয়ে রিসেট করুন.", robots: { index: false, follow: false } };
export default function ForgotPasswordLayout({ children }: { children: ReactNode }) { return children; }
