import type { Metadata } from "next";
import SpringHeading from "@/components/SpringHeading";
import { pageMetadata } from "@/lib/seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicSections from "@/components/DynamicSections";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("privacy");
}

const SECTIONS = [
  {
    h: "১. আমরা যা সংগ্রহ করি",
    p: "টেস্ট দেওয়ার সময় আপনি যে নাম লেখেন, আপনার উত্তর, স্কোর, সময় ও জমা দেওয়ার তারিখ সংরক্ষিত হয়। Writing টেস্টে আপনার লেখা জমা থাকে, যাতে ইনস্ট্রাক্টর তা মূল্যায়ন করতে পারেন। আপনি analytics-এ সম্মতি দিলে, পাবলিক সাইট ভিজিটের জন্য একটি ট্যাব-সীমিত র‌্যান্ডম সেশন আইডি, পূর্ণ IP address, browser/user-agent, device ও operating system, প্রবেশ ও সর্বশেষ পেজ, পেজ ভিউ এবং প্রথম/সর্বশেষ দেখার সময়ও সংরক্ষণ করি।",
  },
  {
    h: "২. তথ্য যেভাবে ব্যবহৃত হয়",
    p: "সংগৃহীত তথ্য শুধু ফলাফল দেখানো, লিডারবোর্ড তৈরি, প্ল্যাটফর্মের মান উন্নয়ন ও নিরাপদ পরিচালনায় ব্যবহৃত হয়। সম্মতিপ্রাপ্ত ভিজিট-ডায়াগনস্টিক তথ্য কেবল অনুমোদিত অ্যাডমিনরা ট্র্যাফিক, ব্রাউজার/ডিভাইস সামঞ্জস্য ও অপব্যবহার শনাক্ত করতে দেখতে পারেন। আপনার নাম ও স্কোর লিডারবোর্ডে প্রকাশ্যে দেখা যায়; প্রকাশ্যে দেখাতে না চাইলে ছদ্মনাম ব্যবহার করতে পারেন।",
  },
  {
    h: "৩. কুকি, সেশন ও আনুমানিক লোকেশন",
    p: "সাইট চালানোর জন্য ন্যূনতম প্রযুক্তিগত তথ্য ব্যবহৃত হয়: টেস্ট চলাকালীন আপনার নাম ব্রাউজারের সেশন স্টোরেজে থাকে, আর অ্যাডমিন লগইনের জন্য একটি কুকি ব্যবহৃত হয়। আপনি “সব গ্রহণ করুন” বেছে নিলে ভিজিটর ডায়াগনস্টিক চালু হয়; এটি persistent fingerprint নয় এবং browser-এর sessionStorage-এ থাকা র‌্যান্ডম আইডি ব্যবহার করে। হোস্টিং প্রোভাইডার IP থেকে country, region বা city পাঠালে আমরা সেই আনুমানিক লোকেশন সংরক্ষণ করতে পারি। লোকেশন সঠিক নাও হতে পারে এবং কোনো header না এলে তা পাওয়া যাবে না। শুধু জরুরি বেছে নিলে এই ডায়াগনস্টিক চালু হয় না।"
  },
  {
    h: "৪. তৃতীয় পক্ষ",
    p: "আমরা আপনার তথ্য বিক্রি করি না। সম্মতি দিলে সাইটে কনফিগার করা analytics সেবা browser-ভিত্তিক analytics তথ্য পেতে পারে এবং সেই সেবার নিজস্ব নীতিমালা প্রযোজ্য হবে। আমাদের ভিজিটর ডায়াগনস্টিকের approximate location কোনো আলাদা IP-geolocation provider-এ পাঠিয়ে নেওয়া হয় না; হোস্টিং প্রোভাইডার request header-এ দিলে কেবল সেটিই ব্যবহৃত হয়।",
  },
  {
    h: "৫. তথ্যের নিরাপত্তা",
    p: "সব তথ্য সুরক্ষিত ডেটাবেইসে সংরক্ষিত হয় এবং শুধু প্ল্যাটফর্ম পরিচালনার প্রয়োজনে ব্যবহৃত হয়। সঠিক উত্তর টেস্ট চলাকালীন ব্রাউজারে পাঠানো হয় না; মূল্যায়ন সার্ভারে হয়।",
  },
  {
    h: "৬. তথ্য মুছে ফেলা",
    p: "আপনার কোনো ফলাফল, লেখা বা সম্মতিপ্রাপ্ত ভিজিট-ডায়াগনস্টিক রেকর্ড মুছে ফেলতে চাইলে প্ল্যাটফর্ম পরিচালকের সাথে যোগাযোগ করুন; যাচাই সাপেক্ষে তা মুছে দেওয়া হবে। ভিজিট রেকর্ড খুঁজতে অনুরোধের সাথে আনুমানিক visit time ও IP address দিতে হতে পারে।",
  },
  {
    h: "৭. নীতিমালা পরিবর্তন",
    p: "এই নীতিমালা সময়ে সময়ে হালনাগাদ হতে পারে। পরিবর্তন হলে এই পৃষ্ঠাতেই প্রকাশ করা হবে।",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8">
        <div className="anim-fade-up">
          <span className="rounded-full bg-[#E51A24]/[0.08] px-4 py-1.5 text-xs font-bold tracking-wide text-[#E51A24]">
            আইনি
          </span>
          <SpringHeading as="h1" className="mt-5 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
            প্রাইভেসি পলিসি
          </SpringHeading>
          <p className="mt-3 text-sm text-[#6C757D]">
            সর্বশেষ হালনাগাদ: {new Date().getFullYear()}
          </p>
        </div>
        <div className="anim-fade-up delay-200 mt-10 space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.h} className="card rounded-lg p-7">
              <SpringHeading as="h2" className="text-lg font-bold text-[#1A1A1A]">{s.h}</SpringHeading>
              <p className="mt-3 text-sm leading-relaxed text-[#6C757D]">
                {s.p}
              </p>
            </section>
          ))}
        </div>
      </main>
      <DynamicSections page="privacy" />
      <Footer />
    </div>
  );
}
