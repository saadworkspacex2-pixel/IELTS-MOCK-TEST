"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "/", label: "হোম" },
  { href: "/exams", label: "টেস্ট" },
  { href: "/leaderboard", label: "লিডারবোর্ড" },
  { href: "/resources", label: "রিসোর্স" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "px-3 pt-3 sm:px-5" : "px-0 pt-0"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-300 ${
          scrolled
            ? "glass max-w-5xl rounded-xl"
            : "glass max-w-7xl rounded-none border-x-0 border-t-0"
        }`}
      >
        <nav className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Logo />

          <div className="skeuo-well hidden items-center gap-1 rounded-full p-1 md:flex">
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                    active
                      ? "skeuo-key text-[#E51A24]"
                      : "text-[#212529] hover:text-[#1A1A1A]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-2.5 md:flex">
            <Link
              href="/profile"
              className="skeuo-key rounded-full px-4 py-2 text-sm font-semibold"
            >
              প্রোফাইল
            </Link>
            <Link
              href="/admin"
              className="skeuo-key rounded-full px-4 py-2 text-sm font-semibold"
            >
              অ্যাডমিন
            </Link>
            <Link
              href="/exams"
              className="btn-red rounded-full px-5 py-2 text-sm font-bold"
            >
              ফ্রি টেস্ট দিন
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setOpen((v) => !v)}
              className="skeuo-key grid h-10 w-10 place-items-center rounded-md text-[#1A1A1A]"
              aria-label="menu"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : ""}`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`}
                />
                <span
                  className={`absolute left-0 top-3 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </nav>

        {open && (
          <div className="anim-fade-in border-t border-black/10 px-4 py-3 md:hidden">
            {[
              ...links,
              { href: "/profile", label: "আমার প্রোফাইল" },
              { href: "/admin", label: "অ্যাডমিন প্যানেল" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="mb-1.5 block rounded-md px-3 py-2.5 text-sm font-semibold text-[#212529] transition hover:bg-black/[0.04]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/exams"
              onClick={() => setOpen(false)}
              className="btn-red mt-2 block rounded-md px-3 py-3 text-center text-sm font-bold"
            >
              ফ্রি টেস্ট দিন
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
