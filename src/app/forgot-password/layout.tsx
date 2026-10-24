import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("forgot_password");
}

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
