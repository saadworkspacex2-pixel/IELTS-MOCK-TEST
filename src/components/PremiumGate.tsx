import Link from "next/link";
import Icon from "@/components/Icon";

export default function PremiumGate({
  title = "এটি প্রিমিয়াম কনটেন্ট",
  description = "এই কনটেন্ট দেখতে একটি প্রিমিয়াম প্ল্যান নির্বাচন করুন। মূল্য ও সুবিধার বিস্তারিত শীঘ্রই যোগ করা হবে।",
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <section className={`card rounded-xl border-amber-200 bg-gradient-to-br from-amber-50 to-white ${compact ? "p-5" : "p-7"}`}>
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
        <span aria-hidden>✦</span> PREMIUM
      </span>
      <h2 className="mt-4 text-lg font-bold text-[#1A1A1A]">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#6C757D]">{description}</p>
      <Link href="/premium" className="btn-red mt-5 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold">
        প্রিমিয়াম অপশন দেখুন <Icon name="arrow" size={15} />
      </Link>
    </section>
  );
}
