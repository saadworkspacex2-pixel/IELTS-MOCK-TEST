import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSettings } from "@/lib/settings";
import { buildThemeCss } from "@/lib/themeCss";
import InjectCode from "@/components/InjectCode";
import VelocityCursor from "@/components/VelocityCursor";
import InstructionTour from "@/components/InstructionTour";
import { Analytics, CookieBanner } from "@/components/AnalyticsConsent";
import { BrandSettingsProvider } from "@/components/BrandSettingsProvider";

// Self-hosted fonts (bundled with the app, no external CDN requests).
// This keeps Bangla + English typography working in every deploy environment.
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "@fontsource/hind-siliguri/300.css";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    description: s.seo_description,
    keywords: s.seo_keywords,
    metadataBase: new URL(s.site_url || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: s.browser_title || s.seo_title, template: `%s | ${s.site_name}` },
    applicationName: s.site_name,
    ...(s.favicon_url && {
      icons: { icon: s.favicon_url, shortcut: s.favicon_url, apple: s.favicon_url },
    }),
    openGraph: {
      title: s.seo_title,
      description: s.seo_description,
      siteName: s.site_name,
      type: "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seo_title,
      description: s.seo_description,
      images: ["/opengraph-image"],
    },
    robots: { index: true, follow: true },
    verification: {
      google: [
        "kA0BsAKQpwkvCaycaVdM6lER7NcSv2ddmLY-es6GXOs",
        "nKaYKjeCY9u4rKgizm3IVwZU9453BZWQOnzX9hOmwHw",
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const s = await getSettings();
  return (
    <html lang="bn">
      <body className="bg-white text-[#1A1A1A] antialiased">
        <BrandSettingsProvider settings={s}>
          <style
            id="lhbd-theme"
            dangerouslySetInnerHTML={{ __html: buildThemeCss(s) }}
          />
          <InjectCode html={s.header_code ?? ""} target="head" />
          {children}
          <InstructionTour />
          <CookieBanner />
          <Analytics measurementId={s.analytics_measurement_id} />
          <VelocityCursor />
          <InjectCode html={s.footer_code ?? ""} target="body" />
        </BrandSettingsProvider>
      </body>
    </html>
  );
}
