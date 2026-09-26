import type { ReactNode } from "react";

export function JsonLd({ data }: { data: unknown }) {
  const safe = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safe }} />;
}

export function OrganizationJsonLd(): ReactNode {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://ip-analyzer-pro.vercel.app";
  return <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "IPAnalyzer Pro", url, logo: `${url}/images/logo.svg`, description: "Practical IP and network tools with privacy-conscious defaults." }} />;
}
