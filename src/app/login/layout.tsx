import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("login");
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
