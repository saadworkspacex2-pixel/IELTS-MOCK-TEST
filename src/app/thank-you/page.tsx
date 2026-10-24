import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("thank_you");
}

export default function ThankYouPage() {
  return <div className="min-h-screen bg-transparent"><Navbar /><main className="mx-auto max-w-2xl px-5 pb-28 pt-32 text-center sm:px-8"><div className="card rounded-2xl p-8 sm:p-12"><span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700 mx-auto">✓</span><h1 className="mt-6 text-3xl font-bold">ধন্যবাদ!</h1><p className="mt-4 leading-relaxed text-[#6C757D]">আপনার পেমেন্ট রিকোয়েস্ট জমা হয়েছে। অ্যাডমিন Transaction ID যাচাই করার পর প্রিমিয়াম অ্যাক্সেস চালু করবেন।</p><Link href="/profile" className="btn-red mt-7 inline-block rounded-md px-6 py-3 text-sm font-bold">আমার প্রোফাইলে যান</Link></div></main><Footer /></div>;
}
