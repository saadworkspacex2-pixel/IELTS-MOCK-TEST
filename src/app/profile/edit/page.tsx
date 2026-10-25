import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import SpringHeading from "@/components/SpringHeading";
import { pageMetadata } from "@/lib/seo";
import { currentUser } from "@/lib/userAuth";
import ProfileEditForm from "./ProfileEditForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("profile");
}

export default async function EditProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-[#B50C16] transition hover:text-[#E51A24]">
          <Icon name="arrow" size={16} className="rotate-180" /> প্রোফাইলে ফিরে যান
        </Link>
        <div className="anim-fade-up mt-5">
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#C01520]">ACCOUNT SETTINGS</p>
          <SpringHeading as="h1" className="mt-1 text-3xl font-bold text-[#1A1A1A]">প্রোফাইল সম্পাদনা</SpringHeading>
          <p className="mt-2 text-sm text-[#6C757D]">আপনার প্রোফাইল ছবি, নাম ও মোবাইল নম্বর এখানে পরিবর্তন করতে পারবেন।</p>
        </div>
        <div className="anim-fade-up delay-100 mt-7">
          <ProfileEditForm
            user={{
              nameBn: user.nameBn,
              nameEn: user.nameEn,
              phone: user.phone,
              avatar: user.avatar,
              email: user.email,
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
