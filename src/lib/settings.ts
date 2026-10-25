import { db } from "@/db";
import { settings } from "@/db/schema";

export const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: "LHBD",
  seo_title: "LHBD | মক টেস্ট অনলাইন, আসল স্ক্রিন, সঙ্গে সঙ্গে স্কোর",
  seo_description:
    "কম্পিউটার-ডেলিভার্ড পরীক্ষার মতো স্ক্রিনে Reading, Listening, Writing ও Grammar মক টেস্ট। জমা দেওয়ার সঙ্গে সঙ্গেই ব্যান্ড স্কোর, ব্যাখ্যাসহ উত্তর ও লিডারবোর্ড, সব ফ্রি।",
  seo_keywords:
    "মক টেস্ট, mock test, reading test, listening test, writing task, band score, অনলাইন পরীক্ষা",
  hero_badge: "লাইভ টেস্ট চলছে এখন",
  hero_title_1: "মক টেস্ট অনলাইনে।",
  hero_title_2: "আসল স্ক্রিন,",
  hero_title_accent: "সঙ্গে সঙ্গে স্কোর",
  hero_subtitle:
    "কম্পিউটার-ডেলিভার্ড পরীক্ষার মতোই স্ক্রিন। একই ঘড়ি, একই রিভিউ প্যালেট। Reading ও Listening জমা দেওয়ার সঙ্গে সঙ্গেই ব্যান্ড স্কোর, Writing দেখেন ইনস্ট্রাক্টর। সবকিছু ফ্রি।",
  footer_about:
    "কম্পিউটার-ডেলিভার্ড পরীক্ষার মতো স্ক্রিনে Reading, Listening, Writing ও Grammar মক টেস্ট। জমা দেওয়ার সঙ্গে সঙ্গেই ব্যান্ড স্কোর, ব্যাখ্যাসহ উত্তর আর লিডারবোর্ড, সম্পূর্ণ ফ্রি।",
  cta_title: "আজই প্রস্তুতি শুরু করুন",
  cta_subtitle:
    "রেজিস্ট্রেশন নেই, খরচ নেই। নাম লিখে এক ক্লিকেই আসল পরীক্ষার স্ক্রিনে।",
  header_code: "",
  footer_code: "",
  site_url: "",
  analytics_measurement_id: "",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  payment_bkash_number: "",
  payment_nagad_number: "",
  payment_rocket_number: "",
  payment_upay_number: "",
  payment_instruction: "",
  email_from: "",
  font_bangla_family: "Hind Siliguri",
  font_english_family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Manrope, sans-serif",
  font_english_display_family: "Iowan Old Style, Baskerville, Times New Roman, serif",
  premium_starter_name: "Premium Starter",
  premium_starter_price: "",
  premium_starter_duration: "",
  premium_starter_features: "",
  premium_plus_name: "Premium Plus",
  premium_plus_price: "",
  premium_plus_duration: "",
  premium_plus_features: "",
  premium_pro_name: "Premium Pro",
  premium_pro_price: "",
  premium_pro_duration: "",
  premium_pro_features: "",
};

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(settings);
    const map = { ...DEFAULT_SETTINGS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
