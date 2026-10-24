import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentFlow from "@/components/PaymentFlow";
import { currentUser } from "@/lib/userAuth";
import { getSettings } from "@/lib/settings";
import type { PremiumTier } from "@/lib/premium";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("premium");
}

export default async function PremiumPage() {
  const [user, settings] = await Promise.all([currentUser(), getSettings()]);
  const plans: Array<{ tier: PremiumTier; title: string; price: string; duration: string; features: string; featured?: boolean }> = [
    { tier: "starter", title: settings.premium_starter_name || "Premium Starter", price: settings.premium_starter_price, duration: settings.premium_starter_duration, features: settings.premium_starter_features },
    { tier: "plus", title: settings.premium_plus_name || "Premium Plus", price: settings.premium_plus_price, duration: settings.premium_plus_duration, features: settings.premium_plus_features, featured: true },
    { tier: "pro", title: settings.premium_pro_name || "Premium Pro", price: settings.premium_pro_price, duration: settings.premium_pro_duration, features: settings.premium_pro_features },
  ];
  const wallets = [
    { key: "bkash" as const, label: "bKash", number: settings.payment_bkash_number || "", color: "#e2136e" },
    { key: "nagad" as const, label: "Nagad", number: settings.payment_nagad_number || "", color: "#f15a24" },
    { key: "rocket" as const, label: "Rocket", number: settings.payment_rocket_number || "", color: "#6b2d90" },
    { key: "upay" as const, label: "Upay", number: settings.payment_upay_number || "", color: "#1358a2" },
  ];
  return <div className="min-h-screen bg-white"><Navbar /><main className="mx-auto max-w-7xl px-5 pb-28 pt-28 sm:px-8"><div className="mx-auto max-w-3xl text-center"><span className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold tracking-wide text-amber-800">PREMIUM</span><h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#1A1A1A] sm:text-5xl">আপনার জন্য সঠিক <span className="text-[#E51A24]">Premium</span> বেছে নিন</h1><p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[#6C757D]">তিনটি টিয়ারের মূল্য, মেয়াদ ও সুবিধা অ্যাডমিন প্যানেল থেকে পরিবর্তন করা যায়। Premium কনটেন্ট আনলক করতে নিচের পেমেন্ট রিকোয়েস্ট পাঠান।</p></div><section data-tour="pricing-tiers" className="mt-12 grid gap-6 lg:grid-cols-3">{plans.map((plan) => <article key={plan.tier} className={`relative rounded-2xl border p-7 shadow-sm ${plan.featured ? "border-[#E51A24] bg-red-50/40 ring-2 ring-red-100" : "border-black/10 bg-white"}`}>{plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E51A24] px-3 py-1 text-xs font-bold text-white">জনপ্রিয়</span>}<h2 className="text-xl font-bold text-[#1A1A1A]">{plan.title}</h2><div className="mt-6 rounded-lg bg-white p-4 ring-1 ring-black/5"><p className="text-xs font-bold text-[#6C757D]">মূল্য</p><p className="mt-1 text-lg font-bold text-[#1A1A1A]">{plan.price ? `${plan.price} BDT` : "শীঘ্রই জানানো হবে"}</p>{plan.duration && <p className="mt-1 text-xs text-[#6C757D]">মেয়াদ: {plan.duration}</p>}</div><div className="mt-4 rounded-lg bg-white p-4 ring-1 ring-black/5"><p className="text-xs font-bold text-[#6C757D]">অন্তর্ভুক্ত সুবিধা</p>{plan.features ? <ul className="mt-2 space-y-1 text-sm leading-relaxed text-[#6C757D]">{plan.features.split(/\n|\|/).filter(Boolean).map((feature) => <li key={feature}>✓ {feature}</li>)}</ul> : <p className="mt-1 text-sm leading-relaxed text-[#6C757D]">ফিচার তালিকা শীঘ্রই অ্যাডমিন যোগ করবেন।</p>}</div><PaymentFlow tier={plan.tier} loggedIn={Boolean(user)} wallets={wallets} instruction={settings.payment_instruction} /></article>)}</section><p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-[#6C757D]">পেমেন্ট রিকোয়েস্ট জমা দেওয়ার পর অ্যাডমিন যাচাই করে Premium অ্যাক্সেস চালু করবেন। কোনো পেমেন্ট করার আগে প্রাপকের নম্বর ও অ্যামাউন্ট যাচাই করুন।</p></main><Footer /></div>;
}
