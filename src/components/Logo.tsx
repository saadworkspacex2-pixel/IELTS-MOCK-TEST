"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { brandOf } from "@/lib/branding";
import { useBrandSettings } from "@/components/BrandSettingsProvider";

export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="44" height="44" rx="12" fill="#E51A24" />
      <rect x="10" y="24" width="6" height="10" rx="2" fill="#fff" opacity="0.55" />
      <rect x="19" y="17" width="6" height="17" rx="2" fill="#fff" opacity="0.8" />
      <rect x="28" y="10" width="6" height="24" rx="2" fill="#fff" />
      <circle cx="31" cy="10" r="5.5" fill="#1A1A1A" />
      <path d="M28.6 10.1l1.7 1.7 3-3.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({
  dark = false,
  href = "/",
  settings: providedSettings,
  className = "",
  showText = true,
}: {
  dark?: boolean;
  href?: string | null;
  settings?: Record<string, string>;
  className?: string;
  showText?: boolean;
}) {
  const contextSettings = useBrandSettings();
  const serverSettings = providedSettings ?? contextSettings;
  const [fetchedSettings, setFetchedSettings] = useState<Record<string, string>>({});
  const settings = serverSettings ?? fetchedSettings;

  // The root layout always provides server-rendered branding. The fetch fallback
  // keeps the component usable in isolated previews without flashing a default logo.
  useEffect(() => {
    if (serverSettings) return;
    let active = true;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (active) setFetchedSettings(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [serverSettings]);

  const brand = useMemo(() => brandOf(settings), [settings]);
  const label = settings.logo_text || settings.site_name || "LHBD";
  const tagline = settings.logo_tagline || "মক টেস্ট প্ল্যাটফর্ম";
  const content: ReactNode = (
    <>
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logoUrl}
          alt={`${label} logo`}
          width={brand.width}
          height={brand.height}
          className="lhbd-brand-image shrink-0 object-contain"
          style={{
            width: `${brand.width}px`,
            height: `${brand.height}px`,
            objectFit: brand.objectFit,
            transform: `translate(${brand.x}px, ${brand.y}px)`,
          }}
        />
      ) : (
        <span className="shrink-0 transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-105">
          <LogoMark />
        </span>
      )}
      {brand.showText && showText && (
        <span className="min-w-0 flex flex-col leading-none">
          <span className={`truncate text-xl font-extrabold tracking-tight ${dark ? "text-white" : "text-[#1A1A1A]"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
            {label}<span className="text-[#E51A24]">.</span>
          </span>
          <span className={`mt-1 truncate text-[10px] font-medium tracking-[0.18em] ${dark ? "text-white/50" : "text-[#6C757D]"}`}>
            {tagline}
          </span>
        </span>
      )}
    </>
  );

  const rootClass = `group flex min-w-0 items-center gap-2.5 ${className}`;
  return href ? (
    <Link href={href} className={rootClass} aria-label={`${label} home`}>
      {content}
    </Link>
  ) : (
    <div className={rootClass} aria-label={label}>
      {content}
    </div>
  );
}
