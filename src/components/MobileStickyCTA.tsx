"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileStickyCTA() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/exams/") || pathname === "/premium" || pathname === "/payment") return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 p-3 shadow-[0_-8px_22px_rgba(0,0,0,.1)] backdrop-blur md:hidden">
      <Link href="/exams" data-free-test-start="true" className="btn-red block rounded-md px-4 py-3 text-center text-sm font-bold">
        ফ্রি টেস্ট শুরু করুন
      </Link>
    </div>
  );
}
