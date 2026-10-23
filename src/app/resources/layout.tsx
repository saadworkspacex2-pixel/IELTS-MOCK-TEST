import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "রিসোর্স লাইব্রেরি", description: "IELTS প্রস্তুতির নোট, পিডিএফ, ভিডিও এবং দরকারি রিসোর্স দেখুন।" };
export default function ResourcesLayout({ children }: { children: ReactNode }) { return children; }
