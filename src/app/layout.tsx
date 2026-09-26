import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { direction } from "@/lib/i18n";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "IPAnalyzer Pro — Understand every IP", template: "%s | IPAnalyzer Pro" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  keywords: ["IP lookup", "IP geolocation", "network tools", "reverse DNS", "IPv4", "IPv6"],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: siteConfig.name, title: "IPAnalyzer Pro", description: siteConfig.description, images: ["/images/og-image.svg"] },
  twitter: { card: "summary_large_image", title: "IPAnalyzer Pro", description: siteConfig.description, images: ["/images/og-image.svg"] },
};

export const viewport: Viewport = { themeColor: "#0F1026", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = (await headers()).get("x-app-locale") ?? "en";
  return (
    <html lang={locale} dir={direction(locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en")} suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
