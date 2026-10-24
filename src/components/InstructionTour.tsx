"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { toBn } from "./CountUp";

export type TourStep = {
  selector?: string;
  title: string;
  description: string;
  beforeEnterEvent?: string;
};

type TourDefinition = { key: string; pageLabel: string; steps: TourStep[] };

function getTourForPath(pathname: string): TourDefinition | null {
  if (pathname === "/") return { key: "home", pageLabel: "হোমপেজ পরিচিতি", steps: [
    { selector: '[data-tour="nav-links"]', title: "মূল নেভিগেশন মেনু", description: "এখান থেকে মক টেস্ট তালিকা, প্রিমিয়াম প্যাকেজ, লিডারবোর্ড এবং ফ্রি স্টাডি রিসোর্স পেজে সরাসরি যেতে পারবেন।" },
    { selector: '[data-tour="nav-actions"]', title: "প্রোফাইল, অ্যাডমিন ও কুইক টেস্ট", description: "নিজের স্কোর ও PDF রিপোর্ট পেতে প্রোফাইলে যান, সাইট পরিচালনার জন্য অ্যাডমিনে যান, অথবা সরাসরি টেস্ট শুরু করুন।" },
    { selector: '[data-tour="home-live-demo"]', title: "ইন্টারঅ্যাক্টিভ লাইভ টেস্ট প্রিভিউ", description: "এটি আসল পরীক্ষার মিনি ইঞ্জিন। এখানে ক্লিক করে উত্তর ও হাইলাইট পরীক্ষা করে দেখতে পারবেন।" },
    { selector: '[data-tour="home-premium-tiers"]', title: "৩টি প্রিমিয়াম টায়ার ও One-Tap পেমেন্ট", description: "Premium টেস্ট ও রিসোর্স আনলক করতে পছন্দের টায়ার বেছে নিয়ে bKash, Nagad বা Rocket-এ Send Money করতে পারবেন।" },
  ] };
  if (pathname === "/exams") return { key: "exams-list", pageLabel: "মক টেস্ট তালিকা গাইড", steps: [
    { selector: '[data-tour="exams-filters"]', title: "বিষয়ভিত্তিক ফিল্টার", description: "এখান থেকে বিভাগ বেছে দ্রুত আপনার পছন্দের টেস্ট খুঁজে নিন। Free ও Premium স্ট্যাটাস প্রতিটি টেস্ট কার্ডে স্পষ্টভাবে দেখানো আছে।" },
    { selector: '[data-tour="exams-grid"]', title: "টেস্ট কার্ড ও বিস্তারিত তথ্য", description: "প্রতিটি কার্ডে টেস্টটি FREE নাকি ★ PREMIUM, মোট প্রশ্ন এবং নির্ধারিত সময় লেখা আছে। যেকোনো কার্ডে ক্লিক করে বিস্তারিত দেখুন।" },
  ] };
  if (/^\/exams\/\d+$/.test(pathname)) return { key: "exam-detail", pageLabel: "পরীক্ষা শুরুর নির্দেশনা", steps: [
    { selector: '[data-tour="exam-start-card"]', title: "পরীক্ষা শুরু করার বক্স", description: "ফ্রি টেস্ট হলে নাম লিখে ‘এখনই শুরু করুন’ চাপলেই পরীক্ষা পূর্ণস্ক্রিনে শুরু হবে। Premium টেস্ট হলে এখান থেকেই প্যাকেজ আনলক করতে পারবেন।" },
  ] };
  if (/^\/exams\/\d+\/take$/.test(pathname)) return { key: "exam-take", pageLabel: "লাইভ পরীক্ষার স্ক্রিন গাইড", steps: [
    { selector: 'header [role="timer"]', title: "অফিসিয়াল কাউন্টডাউন ঘড়ি", description: "উপরে ডান পাশে পরীক্ষার বাকি সময় চলছে। শেষ ৫ মিনিটে ঘড়িটি লাল সংকেত দেবে এবং সময় শেষ হলে স্বয়ংক্রিয়ভাবে জমা হবে।" },
    { selector: ".exam-split-shell", title: "বামে প্যাসেজ/অডিও · ডানে প্রশ্নপত্র", description: "বাম পাশের প্যাসেজে Highlight ব্যবহার করতে পারবেন। মাঝের বার টেনে দুই প্যানেলের প্রস্থ ছোট-বড় করা যায়।" },
    { selector: 'header button.btn-red', title: "প্রশ্ন প্যালেট ও জমা দেওয়া", description: "প্যালেট বোতামে কোন প্রশ্ন উত্তর দেওয়া হয়েছে বা Review ফ্ল্যাগ করা আছে তা দেখবেন। সব শেষে ‘জমা দিন’ চাপুন।" },
  ] };
  if (pathname === "/login") return { key: "user-login", pageLabel: "লগইন ও রেজিস্ট্রেশন গাইড", steps: [
    { selector: '[data-tour="login-card"]', title: "শিক্ষার্থী লগইন ও প্রোফাইল তৈরি", description: "ইমেইল বা মোবাইল নম্বর দিয়ে লগইন করুন। নতুন হলে রেজিস্ট্রেশন ট্যাবে ছবি, বাংলা ও ইংরেজি নামসহ অ্যাকাউন্ট খুলুন। পাসওয়ার্ড ভুলে গেলে রিসেট লিংক ব্যবহার করুন।" },
  ] };
  if (pathname === "/forgot-password") return { key: "forgot-password", pageLabel: "পাসওয়ার্ড রিকভারি গাইড", steps: [
    { selector: '[data-tour="forgot-card"]', title: "ইমেইল OTP দিয়ে পাসওয়ার্ড রিসেট", description: "রেজিস্টার করা ইমেইল দিলে ৬ সংখ্যার OTP কোড পাঠানো হবে। কোড ও নতুন পাসওয়ার্ড দিলেই অ্যাকাউন্ট পুনরুদ্ধার হবে।" },
  ] };
  if (pathname === "/premium" || pathname === "/pricing") return { key: "pricing", pageLabel: "প্রিমিয়াম ও পেমেন্ট গাইড", steps: [
    { selector: '[data-tour="pricing-tiers"]', title: "৩টি প্রিমিয়াম প্যাকেজ", description: "এখান থেকে আপনার প্রয়োজনমতো Premium Starter, Premium Plus অথবা Premium Pro প্যাকেজ নির্বাচন করুন।" },
    { selector: '[data-tour="bd-send-money"]', title: "One-Tap Send Money", description: "পেমেন্ট মাধ্যম বেছে One-Tap Send Money চাপলে নম্বর কপি হবে। টাকা পাঠিয়ে Sender নম্বর ও TrxID লিখে জমা দিন।" },
  ] };
  if (pathname === "/admin/login") return { key: "admin-login", pageLabel: "অ্যাডমিন লগইন নির্দেশনা", steps: [
    { selector: '[data-tour="admin-login-card"]', title: "অ্যাডমিন ও স্টাফ প্রবেশদ্বার", description: "Super Admin হলে ইমেইল ফাঁকা রেখে শুধু পাসওয়ার্ড দিন। নিযুক্ত স্টাফ হলে স্টাফ ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।" },
  ] };
  if (pathname === "/admin") return { key: "admin-dashboard", pageLabel: "অ্যাডমিন প্যানেল পরিচিতি", steps: [
    { selector: '[data-tour="admin-sidebar"]', title: "অ্যাডমিন কন্ট্রোল মেনু", description: "বাম পাশের মেনু থেকে পরীক্ষা ও প্রশ্ন তৈরি, Premium পেমেন্ট, গ্রেডিং, পেজ, লোগো ও থিম নিয়ন্ত্রণ করুন।" },
    { selector: '[data-tour="admin-new-exam-shortcut"]', title: "দ্রুত নতুন পরীক্ষা তৈরি", description: "এই বোতামে ক্লিক করে Reading, Listening, Writing বা MCQ মক টেস্ট তৈরি করতে পারবেন।" },
  ] };
  if (pathname === "/admin/exams") return { key: "admin-exams-list", pageLabel: "পরীক্ষা ম্যানেজমেন্ট গাইড", steps: [
    { selector: '[data-tour="admin-new-exam-btn"]', title: "নতুন পরীক্ষা তৈরি করুন", description: "নতুন একটি মক টেস্ট খুলতে এই বোতামে ক্লিক করুন। তৈরির পর প্যাসেজ, অডিও এবং প্রশ্ন যোগ করার পেজে নিয়ে যাবে।" },
    { selector: '[data-tour="admin-bulk-tools"]', title: "JSON / CSV ইমপোর্ট ও এক্সপোর্ট", description: "একসাথে অনেক প্রশ্ন আপলোড করতে JSON বা CSV ফাইল ইমপোর্ট করুন, অথবা পরীক্ষার ব্যাকআপ ডাউনলোড করুন।" },
    { selector: '[data-tour="admin-exams-table"]', title: "ফ্রি/প্রিমিয়াম ও প্রশ্ন সম্পাদনা", description: "টেবিল থেকে পরীক্ষা Live/Off করুন; সম্পাদনা পেজে গিয়ে একে Free বা ★ Premium করুন এবং প্রশ্ন যোগ, এডিট ও ডিলিট করুন।" },
  ] };
  if (pathname === "/admin/exams/new") return { key: "admin-exam-new", pageLabel: "নতুন পরীক্ষা তৈরির গাইড", steps: [
    { selector: '[data-tour="admin-exam-form"]', title: "পরীক্ষার মূল তথ্য পূরণ", description: "পরীক্ষার নাম, মডিউল, সময় এবং প্রতি প্রশ্নের নম্বর নির্ধারণ করুন।" },
    { selector: '[data-tour="admin-exam-premium-box"]', title: "ফ্রি নাকি প্রিমিয়াম নির্ধারণ", description: "কনটেন্ট অ্যাক্সেস থেকে পরীক্ষা Free অথবা Premium নির্বাচন করুন। সেভ করার পর প্রশ্ন যোগ করার পেজ খুলবে।" },
  ] };
  if (/^\/admin\/exams\/\d+$/.test(pathname)) return { key: "admin-question-manager", pageLabel: "প্রশ্ন ও প্যাসেজ ম্যানেজার গাইড", steps: [
    { selector: '[data-tour="admin-exam-form"]', title: "১. পরীক্ষার সেটিংস ও Premium নিয়ন্ত্রণ", description: "পরীক্ষার নাম, সময়, Free/Premium অ্যাক্সেস এবং anti-cheat বা shuffle নিয়ম পরিবর্তন করে সংরক্ষণ করুন।" },
    { selector: '[data-tour="qm-undo-redo"]', title: "২. Undo ও Redo সুরক্ষা", description: "প্রশ্ন বা প্যাসেজ যোগ, এডিট বা ডিলিটে ভুল হলে Undo/Redo চেপে আগের অবস্থায় ফিরে যান।" },
    { selector: '[data-tour="qm-passages-box"]', title: "৩. প্যাসেজ / অডিও / রাইটিং টাস্ক", description: "Reading হলে একাধিক প্যাসেজ, Listening হলে MP3/WAV অডিও এবং Writing হলে টাস্ক যোগ করুন।" },
    { selector: '[data-tour="qm-add-question-box"]', beforeEnterEvent: "lhbd:open-question-form", title: "৪. নতুন প্রশ্ন যোগ করার বক্স", description: "‘নতুন প্রশ্ন যোগ করুন’ প্যানেলটি খুলে গেছে। এখান থেকেই পরীক্ষায় নতুন প্রশ্ন যুক্ত করা হয়।" },
    { selector: '[data-tour="qm-qtype-box"]', beforeEnterEvent: "lhbd:open-question-form", title: "৫. প্রশ্নের ধরন ও প্যাসেজ নির্বাচন", description: "MCQ, True/False/Not Given, Gap Fill, Matching, Drag-Drop বা Essay বেছে নিন। Reading/Listening প্রশ্নের প্যাসেজও নির্বাচন করুন।" },
    { selector: '[data-tour="qm-question-text"]', beforeEnterEvent: "lhbd:open-question-form", title: "৬. মূল প্রশ্ন লেখার বক্স", description: "এই টেক্সট বক্সে প্রশ্ন লিখুন। Gap Fill হলে বাক্যের খালি জায়গায় ______ ব্যবহার করতে পারেন।" },
    { selector: '[data-tour="qm-options-box"]', beforeEnterEvent: "lhbd:open-question-form", title: "৭. অপশন ও সঠিক উত্তর", description: "MCQ-তে A, B, C, D অপশন লিখে সঠিকটি নির্বাচন করুন। Gap Fill-এ গ্রহণযোগ্য উত্তর | চিহ্ন দিয়ে লিখুন, যেমন six|6।" },
    { selector: '[data-tour="qm-explanation-box"]', beforeEnterEvent: "lhbd:open-question-form", title: "৮. ব্যাখ্যা ও সংরক্ষণ", description: "শিক্ষার্থীদের জন্য উত্তরের ব্যাখ্যা লিখুন। T/F/NG প্রশ্নে ব্যাখ্যা আবশ্যক। এরপর লাল বোতাম চাপলেই প্রশ্ন সেভ হবে।" },
    { selector: '[data-tour="qm-questions-list"]', title: "৯. প্রশ্ন এডিট ও ডিলিট", description: "নিচে সব প্রশ্নের তালিকা থাকে। সম্পাদনা চাপলে ফর্মে প্রশ্নটি লোড হয়, আর মুছুন চাপলে ডিলিট হয়।" },
  ] };
  if (pathname === "/admin/payments") return { key: "admin-payments", pageLabel: "প্রিমিয়াম ও পেমেন্ট অ্যাডমিন গাইড", steps: [
    { selector: '[data-tour="admin-payment-inbox"]', title: "পেমেন্ট রিকোয়েস্ট অনুমোদন", description: "শিক্ষার্থীরা Send Money করে TrxID পাঠালে এখানে জমা হয়। অনুমোদন করলেই Premium অ্যাক্সেস স্বয়ংক্রিয়ভাবে চালু হবে।" },
    { selector: '[data-tour="admin-tiers-editor"]', title: "৩টি Premium টায়ারের মূল্য ও সুবিধা", description: "এখানে Tier 1, Tier 2 ও Tier 3-এর নাম, মূল্য, মেয়াদ এবং সুবিধা লিখে সংরক্ষণ করতে পারবেন।" },
    { selector: '[data-tour="admin-bd-methods"]', title: "বাংলাদেশ পেমেন্ট নম্বর", description: "নিজস্ব bKash, Nagad ও Rocket নম্বর এবং পেমেন্ট নির্দেশনা এখান থেকে আপডেট করুন।" },
  ] };
  if (pathname.startsWith("/admin/")) return { key: `admin-${pathname.replace(/\W+/g, "-")}`, pageLabel: "অ্যাডমিন সেকশন নির্দেশনা", steps: [
    { selector: "main", title: "অ্যাডমিন ওয়ার্কস্পেস", description: "এই পেজ থেকে সংশ্লিষ্ট কনটেন্ট, ফাইল, থিম বা ফলাফল পরিবর্তন ও সংরক্ষণ করতে পারবেন। পরিবর্তন দ্রুত সাইটে কার্যকর হবে।" },
  ] };
  return null;
}

type RectBox = { top: number; left: number; width: number; height: number };

function visibleTarget(selector: string) {
  if (typeof document === "undefined") return null;
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width >= 4 && rect.height >= 4 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || "1") > 0;
  }) ?? null;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function triggerGuidedTour() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("lhbd:start-tour"));
}

export default function InstructionTour() {
  const pathname = usePathname();
  const tour = useMemo(() => getTourForPath(pathname), [pathname]);
  const storageKey = tour ? `lhbd_tour_v3_${tour.key}` : "";
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [spot, setSpot] = useState<RectBox | null>(null);
  const [vp, setVp] = useState({ w: 1200, h: 800 });
  const step = tour?.steps[stepIdx] ?? null;

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-free-test-start="true"]')) return;
      sessionStorage.setItem("lhbd_force_tour_once", "1");
    };
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, []);

  // Home remains quiet. A Free Test click arms a single guide on the destination page.
  useEffect(() => {
    if (pathname === "/" || !tour || !storageKey) {
      const timer = window.setTimeout(() => setOpen(false), 0);
      return () => window.clearTimeout(timer);
    }
    const forced = sessionStorage.getItem("lhbd_force_tour_once") === "1";
    const seen = localStorage.getItem(storageKey);
    if (!forced && seen) {
      const timer = window.setTimeout(() => setOpen(false), 0);
      return () => window.clearTimeout(timer);
    }
    if (forced) sessionStorage.removeItem("lhbd_force_tour_once");
    const timer = window.setTimeout(() => {
      setSpot(null);
      setStepIdx(0);
      setOpen(true);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [pathname, storageKey, tour]);

  useEffect(() => {
    const start = () => {
      if (!tour) return;
      setSpot(null);
      setStepIdx(0);
      setOpen(true);
    };
    window.addEventListener("lhbd:start-tour", start);
    return () => window.removeEventListener("lhbd:start-tour", start);
  }, [tour]);

  const measureTarget = useCallback(() => {
    if (typeof window === "undefined") return;
    const nextVp = { w: window.innerWidth, h: window.innerHeight };
    setVp((current) => current.w === nextVp.w && current.h === nextVp.h ? current : nextVp);
    if (!open || !step?.selector) {
      setSpot(null);
      return;
    }
    const element = visibleTarget(step.selector);
    if (!element) {
      setSpot(null);
      return;
    }
    const rect = element.getBoundingClientRect();
    const pad = 9;
    const top = clamp(rect.top - pad, 4, nextVp.h - 4);
    const left = clamp(rect.left - pad, 4, nextVp.w - 4);
    const bottom = clamp(rect.bottom + pad, 4, nextVp.h - 4);
    const right = clamp(rect.right + pad, 4, nextVp.w - 4);
    if (bottom - top < 18 || right - left < 18) {
      setSpot(null);
      return;
    }
    const next = { top, left, width: right - left, height: bottom - top };
    setSpot((current) => current && Math.abs(current.top - next.top) < 0.5 && Math.abs(current.left - next.left) < 0.5 && Math.abs(current.width - next.width) < 0.5 && Math.abs(current.height - next.height) < 0.5 ? current : next);
  }, [open, step]);

  useEffect(() => {
    if (!open || !step) return;
    if (step.beforeEnterEvent) window.dispatchEvent(new CustomEvent(step.beforeEnterEvent));

    let cancelled = false;
    let frame = 0;
    let retry = 0;
    let timeout = 0;
    let observer: ResizeObserver | null = null;

    const update = () => {
      if (cancelled) return;
      measureTarget();
      const target = step.selector ? visibleTarget(step.selector) : null;
      if (target) {
        const rect = target.getBoundingClientRect();
        if (rect.top < 78 || rect.bottom > window.innerHeight - 42) {
          target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
        observer?.disconnect();
        observer = new ResizeObserver(() => requestAnimationFrame(measureTarget));
        observer.observe(target);
      } else if (retry < 12) {
        retry += 1;
        timeout = window.setTimeout(update, 90);
      }
    };

    frame = window.requestAnimationFrame(() => {
      timeout = window.setTimeout(update, 60);
    });
    const onViewportChange = () => window.requestAnimationFrame(measureTarget);
    window.addEventListener("resize", onViewportChange, { passive: true });
    window.addEventListener("scroll", onViewportChange, { passive: true, capture: true });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      observer?.disconnect();
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [measureTarget, open, step]);

  const closeTour = () => {
    if (storageKey) localStorage.setItem(storageKey, "1");
    setSpot(null);
    setOpen(false);
  };
  const goToStep = (index: number) => {
    setSpot(null);
    setStepIdx(Math.max(0, Math.min((tour?.steps.length ?? 1) - 1, index)));
  };

  if (!open || !tour || !step) return null;

  const total = tour.steps.length;
  const isLast = stepIdx >= total - 1;
  const cardWidth = Math.min(396, vp.w - 24);
  let cardTop = Math.max(18, (vp.h - 246) / 2);
  let cardLeft = Math.max(12, (vp.w - cardWidth) / 2);
  if (spot) {
    const spaceBelow = vp.h - (spot.top + spot.height);
    cardTop = spaceBelow >= 238 ? spot.top + spot.height + 14 : spot.top >= 238 ? Math.max(12, spot.top - 226) : Math.max(12, vp.h - 248);
    cardLeft = clamp(spot.left, 12, Math.max(12, vp.w - cardWidth - 12));
  }
  const blurStyle = { backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", backgroundColor: "rgba(15,23,42,.46)" };

  return <div className="pointer-events-none fixed inset-0 z-[9500]" role="dialog" aria-label={tour.pageLabel}>
    {spot && <>
      <div aria-hidden="true" className="pointer-events-none fixed" style={{ ...blurStyle, top: 0, left: 0, right: 0, height: spot.top }} />
      <div aria-hidden="true" className="pointer-events-none fixed" style={{ ...blurStyle, top: spot.top + spot.height, left: 0, right: 0, bottom: 0 }} />
      <div aria-hidden="true" className="pointer-events-none fixed" style={{ ...blurStyle, top: spot.top, left: 0, width: spot.left, height: spot.height }} />
      <div aria-hidden="true" className="pointer-events-none fixed" style={{ ...blurStyle, top: spot.top, left: spot.left + spot.width, right: 0, height: spot.height }} />
      <div aria-hidden="true" className="pointer-events-none fixed rounded-xl border-2 border-[#E51A24] transition-[top,left,width,height] duration-150 ease-out" style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height, boxShadow: "0 0 0 4px rgba(255,255,255,.92),0 12px 32px rgba(0,0,0,.28)" }}>
        <span className="absolute -top-3 left-3 rounded-full bg-[#E51A24] px-2.5 py-0.5 text-[10px] font-bold text-white shadow">ধাপ {toBn(stepIdx + 1)} / {toBn(total)}</span>
      </div>
    </>}
    <div className="pointer-events-auto anim-pop card fixed z-[9510] rounded-2xl border border-black/15 bg-white p-5 shadow-2xl" style={{ top: cardTop, left: cardLeft, width: cardWidth }}>
      <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-[#E51A24]">{tour.pageLabel} · {toBn(stepIdx + 1)}/{toBn(total)}</span><button type="button" onClick={closeTour} className="skeuo-key rounded-md px-2.5 py-1 text-xs font-bold text-[#6C757D]">স্কিপ ✕</button></div>
      {!spot && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500" aria-live="polite">নির্দেশিত অংশটি প্রস্তুত হচ্ছে…</p>}
      <h3 className="mt-3 text-base font-extrabold text-[#1A1A1A]">{step.title}</h3><p className="mt-2 text-xs leading-relaxed text-[#6C757D] sm:text-sm">{step.description}</p>
      <div className="mt-4 flex items-center gap-1.5">{tour.steps.map((_, index) => <button key={index} type="button" aria-label={`ধাপ ${index + 1}`} onClick={() => goToStep(index)} className={`h-1.5 rounded-full transition-all ${index === stepIdx ? "w-6 bg-[#E51A24]" : "w-2 bg-slate-200"}`} />)}</div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-black/[.08] pt-3.5"><button type="button" onClick={() => goToStep(stepIdx - 1)} disabled={stepIdx === 0} className="skeuo-key rounded-lg px-3.5 py-2 text-xs font-bold disabled:opacity-35">← আগের ধাপ</button>{isLast ? <button type="button" onClick={closeTour} className="btn-red rounded-lg px-5 py-2 text-xs font-bold">বুঝেছি ✓</button> : <button type="button" onClick={() => goToStep(stepIdx + 1)} className="btn-red rounded-lg px-5 py-2 text-xs font-bold">পরের ধাপ →</button>}</div>
    </div>
  </div>;
}
