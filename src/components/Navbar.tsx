"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import MobileStickyCTA from "./MobileStickyCTA";
import { triggerGuidedTour } from "./InstructionTour";
import LanguageToggle from "./LanguageToggle";
import { useLocale } from "./LocaleProvider";
import { translateBnText } from "@/lib/interfaceTranslations";

const links = [
  { href: "/", label: "হোম" },
  { href: "/exams", label: "টেস্ট" },
  { href: "/leaderboard", label: "লিডারবোর্ড" },
  { href: "/resources", label: "রিসোর্স" },
  { href: "/premium", label: "Premium" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const text = (value: string) => translateBnText(value, locale);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ${scrolled ? "px-2 pt-2 sm:px-4 sm:pt-3" : "px-0 pt-0"}`}>
      <div className={`mx-auto w-full transition-all duration-300 ${scrolled ? "glass max-w-7xl rounded-2xl" : "glass max-w-7xl rounded-none border-x-0 border-t-0"}`}>
        <nav className="flex h-16 flex-nowrap items-center justify-between gap-3 px-3 sm:px-5">
          <Logo className="max-w-[11rem] shrink-0 sm:max-w-[14rem]" />

          <div data-tour="nav-links" className="skeuo-well hidden min-w-0 items-center gap-0.5 rounded-full p-1 min-[1180px]:flex">
            {links.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-tour={link.href === "/exams" ? "nav-tests" : link.href === "/premium" ? "nav-premium" : undefined}
                  className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all xl:px-4 xl:text-sm ${active ? "skeuo-key text-[#E51A24]" : "text-[#212529] hover:text-[#1A1A1A]"}`}
                >
                  {text(link.label)}
                </Link>
              );
            })}
          </div>

          <div data-tour="nav-actions" className="hidden shrink-0 items-center gap-2 min-[1180px]:flex">
            <LanguageToggle />
            <button type="button" onClick={triggerGuidedTour} className="hidden skeuo-key whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold 2xl:inline-flex">{text("গাইড")}</button>
            <Link href="/login" data-tour="nav-login" className="skeuo-key whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold xl:px-4 xl:text-sm">{text("লগইন")}</Link>
            <Link href="/profile" className="skeuo-key hidden whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold 2xl:inline-flex xl:px-4 xl:text-sm">{text("প্রোফাইল")}</Link>
            <Link href="/admin" className="skeuo-key hidden whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold 2xl:inline-flex xl:px-4 xl:text-sm">{text("অ্যাডমিন")}</Link>
            <Link href="/exams" data-free-test-start="true" className="btn-red whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold xl:px-5 xl:text-sm">{text("ফ্রি টেস্ট দিন")}</Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 min-[1180px]:hidden">
            <LanguageToggle compact />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="skeuo-key grid h-10 w-10 place-items-center rounded-xl text-[#1A1A1A]"
              aria-label={text(open ? "মেনু বন্ধ করুন" : "মেনু খুলুন")}
              aria-expanded={open}
            >
              <span className="relative block h-3.5 w-5">
                <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : ""}`} />
                <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
                <span className={`absolute left-0 top-3 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </nav>

        {open && (
          <div className="anim-fade-in border-t border-black/10 px-3 py-3 min-[1180px]:hidden">
            <div className="grid gap-1 sm:grid-cols-2">
              {[...links, { href: "/login", label: "লগইন" }, { href: "/profile", label: "আমার প্রোফাইল" }, { href: "/admin", label: "অ্যাডমিন প্যানেল" }].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#212529] transition hover:bg-black/[0.04]"
                >
                  {text(link.label)}
                </Link>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => { closeMenu(); triggerGuidedTour(); }} className="skeuo-key rounded-lg px-3 py-2.5 text-xs font-bold">{text("গাইড দেখুন")}</button>
              <Link href="/exams" data-free-test-start="true" onClick={closeMenu} className="btn-red flex-1 whitespace-nowrap rounded-lg px-3 py-3 text-center text-sm font-bold">{text("ফ্রি টেস্ট দিন")}</Link>
            </div>
          </div>
        )}
      </div>
      <MobileStickyCTA />
    </header>
  );
}
