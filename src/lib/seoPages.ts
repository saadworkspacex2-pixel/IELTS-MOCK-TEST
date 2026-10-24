export type SeoPage = {
  key: string;
  label: string;
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  noIndex?: boolean;
};

export const SEO_PAGES: SeoPage[] = [
  { key: "home", label: "হোম", path: "/", fallbackTitle: "IELTS Mock Test", fallbackDescription: "বাংলায় IELTS Reading, Listening, Writing ও Grammar মক টেস্ট অনুশীলন করুন।" },
  { key: "exams", label: "সব মক টেস্ট", path: "/exams", fallbackTitle: "মক টেস্ট", fallbackDescription: "Reading, Listening, Writing ও Grammar মক টেস্ট বেছে নিয়ে অনুশীলন করুন।" },
  { key: "leaderboard", label: "লিডারবোর্ড", path: "/leaderboard", fallbackTitle: "লিডারবোর্ড", fallbackDescription: "IELTS Mock Test-এর সাম্প্রতিক সেরা ফলাফল ও স্কোর দেখুন।" },
  { key: "resources", label: "রিসোর্স", path: "/resources", fallbackTitle: "স্টাডি রিসোর্স", fallbackDescription: "IELTS প্রস্তুতির নোট, ভিডিও, PDF ও সহায়ক রিসোর্স দেখুন।" },
  { key: "premium", label: "Premium", path: "/premium", fallbackTitle: "Premium প্ল্যান", fallbackDescription: "Premium IELTS মক টেস্ট ও রিসোর্স আনলক করার প্যাকেজ দেখুন।" },
  { key: "login", label: "লগইন / রেজিস্ট্রেশন", path: "/login", fallbackTitle: "লগইন", fallbackDescription: "IELTS Mock Test অ্যাকাউন্টে লগইন বা নতুন অ্যাকাউন্ট তৈরি করুন।", noIndex: true },
  { key: "forgot_password", label: "পাসওয়ার্ড রিসেট", path: "/forgot-password", fallbackTitle: "পাসওয়ার্ড রিসেট", fallbackDescription: "ইমেইল OTP দিয়ে আপনার পাসওয়ার্ড নিরাপদে রিসেট করুন।", noIndex: true },
  { key: "profile", label: "প্রোফাইল", path: "/profile", fallbackTitle: "আমার প্রোফাইল", fallbackDescription: "আপনার IELTS প্রস্তুতির প্রোফাইল ও ফলাফল দেখুন।", noIndex: true },
  { key: "terms", label: "ব্যবহারের শর্তাবলি", path: "/terms", fallbackTitle: "ব্যবহারের শর্তাবলি", fallbackDescription: "IELTS Mock Test ব্যবহারের শর্তাবলি পড়ুন।" },
  { key: "privacy", label: "প্রাইভেসি পলিসি", path: "/privacy", fallbackTitle: "প্রাইভেসি পলিসি", fallbackDescription: "IELTS Mock Test কীভাবে তথ্য ব্যবহার ও সুরক্ষিত করে তা জানুন।" },
  { key: "thank_you", label: "পেমেন্ট ধন্যবাদ", path: "/thank-you", fallbackTitle: "ধন্যবাদ", fallbackDescription: "আপনার Premium পেমেন্ট রিকোয়েস্টের অবস্থা দেখুন।", noIndex: true },
];

export const seoSettingKey = (pageKey: string, field: "title" | "description" | "keywords" | "hashtags") => `seo_page_${pageKey}_${field}`;
