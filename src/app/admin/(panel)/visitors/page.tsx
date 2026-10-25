import SpringHeading from "@/components/SpringHeading";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { visitorLogs } from "@/db/schema";
import { canAccess } from "@/lib/adminAuth";
import { toBn } from "@/lib/bn";

export const dynamic = "force-dynamic";

function seenAt(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return toBn(
    date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );
}

function location(visitor: { city: string; region: string; country: string }) {
  return [visitor.city, visitor.region, visitor.country].filter(Boolean).join(", ") || "পাওয়া যায়নি";
}

export default async function VisitorsPage() {
  if (!(await canAccess("visitors"))) {
    return <p className="card rounded-lg p-8 text-center text-[#6C757D]">এই অংশে আপনার অ্যাক্সেস নেই।</p>;
  }

  const rows = await db
    .select()
    .from(visitorLogs)
    .orderBy(desc(visitorLogs.lastSeen))
    .limit(500);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const today = rows.filter((visitor) => new Date(visitor.firstSeen) >= dayStart).length;
  const pageViews = rows.reduce((total, visitor) => total + visitor.pageViews, 0);
  const locations = new Set(rows.map((visitor) => location(visitor)).filter((value) => value !== "পাওয়া যায়নি"));

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <SpringHeading as="h1" className="text-2xl font-bold">ভিজিটর মনিটরিং</SpringHeading>
          <p className="mt-1 max-w-2xl text-sm text-[#6C757D]">
            সম্মতি দেওয়া পাবলিক সেশনগুলোর সর্বশেষ কার্যকলাপ। ভিজিটর আইডি ট্যাবের সেশন পর্যন্ত সীমিত; অ্যাডমিন ট্র্যাফিক এখানে অন্তর্ভুক্ত নয়।
          </p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">সর্বশেষ ৫০০ সেশন</span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card rounded-lg p-5"><p className="text-2xl font-extrabold">{toBn(rows.length)}</p><p className="mt-1 text-xs text-[#6C757D]">দেখানো সেশন</p></div>
        <div className="card rounded-lg p-5"><p className="text-2xl font-extrabold">{toBn(today)}</p><p className="mt-1 text-xs text-[#6C757D]">আজ প্রথম দেখা</p></div>
        <div className="card rounded-lg p-5"><p className="text-2xl font-extrabold">{toBn(pageViews)}</p><p className="mt-1 text-xs text-[#6C757D]">রেকর্ডকৃত পেজ ভিউ</p></div>
        <div className="card rounded-lg p-5"><p className="text-2xl font-extrabold">{toBn(locations.size)}</p><p className="mt-1 text-xs text-[#6C757D]">লোকেশন রিপোর্ট করেছে</p></div>
      </div>

      <section className="card overflow-hidden rounded-lg">
        <div className="border-b border-black/[0.06] px-5 py-4">
          <SpringHeading as="h2" className="font-bold">সাম্প্রতিক পাবলিক ভিজিট</SpringHeading>
          <p className="mt-1 text-xs text-[#6C757D]">লোকেশনটি হোস্টিং প্রোভাইডারের IP-ভিত্তিক হেডার থেকে আসে, তাই এটি আনুমানিক বা ফাঁকা থাকতে পারে।</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full text-sm">
            <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]">
              <tr>
                <th className="px-5 py-3">প্রবেশের সময়</th>
                <th className="px-5 py-3">সর্বশেষ দেখা</th>
                <th className="px-5 py-3">IP ঠিকানা</th>
                <th className="px-5 py-3">লোকেশন</th>
                <th className="px-5 py-3">ব্রাউজার</th>
                <th className="px-5 py-3">ডিভাইস / OS</th>
                <th className="px-5 py-3">এন্ট্রি → সর্বশেষ পেজ</th>
                <th className="px-5 py-3 text-right">পেজ ভিউ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rows.map((visitor) => (
                <tr key={visitor.id} className="align-top">
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#6C757D]">{seenAt(visitor.firstSeen)}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#6C757D]">{seenAt(visitor.lastSeen)}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs">{visitor.ip || "পাওয়া যায়নি"}</td>
                  <td className="max-w-52 px-5 py-3.5 text-xs text-[#6C757D]">{location(visitor)}</td>
                  <td className="px-5 py-3.5"><span className="block font-semibold">{visitor.browser || "Unknown browser"}</span><span className="block max-w-48 truncate text-[11px] text-[#6C757D]" title={visitor.userAgent}>{visitor.userAgent || "User agent নেই"}</span></td>
                  <td className="px-5 py-3.5"><span className="block font-semibold">{visitor.device || "পাওয়া যায়নি"}</span><span className="block text-xs text-[#6C757D]">{visitor.operatingSystem || "Unknown OS"}</span></td>
                  <td className="px-5 py-3.5 text-xs"><span className="block font-mono">{visitor.entryPath}</span><span className="block font-mono text-[#6C757D]">→ {visitor.lastPath}</span></td>
                  <td className="px-5 py-3.5 text-right font-bold">{toBn(visitor.pageViews)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-[#6C757D]">এখনও কোনো সম্মতিপ্রাপ্ত পাবলিক ভিজিট রেকর্ড হয়নি।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
