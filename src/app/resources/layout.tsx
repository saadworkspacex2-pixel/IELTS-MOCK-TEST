import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("resources");
}

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return children;
}
