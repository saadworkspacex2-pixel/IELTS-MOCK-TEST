import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return <div className="min-h-screen bg-white"><Navbar /><main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 pt-28 pb-20 text-center"><div><p className="text-7xl font-black text-[#E51A24]">404</p><h1 className="mt-4 text-3xl font-bold">পেজটি পাওয়া যায়নি</h1><p className="mx-auto mt-3 max-w-md text-[#6C757D]">লিংকটি ভুল হতে পারে অথবা পেজটি সরানো হয়েছে। আপনি হোমপেজ বা টেস্ট তালিকায় ফিরে যেতে পারেন।</p><div className="mt-7 flex justify-center gap-3"><Link href="/" className="skeuo-key rounded-md px-5 py-3 text-sm font-bold">হোমপেজ</Link><Link href="/exams" className="btn-red rounded-md px-5 py-3 text-sm font-bold">টেস্ট দেখুন</Link></div></div></main><Footer /></div>;
}
