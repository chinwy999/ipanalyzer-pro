# IPAnalyzer Pro

A multilingual, privacy-conscious IP and network utility suite built with the Next.js App Router. The application presents ten practical tools, educational guides and localized policy pages in English, Arabic and French.

## Features

- Localized routes for English (`/en`), Arabic (`/ar`, RTL) and French (`/fr`), including a redirect from `/` to `/en`.
- Responsive dark network dashboard, language switcher that retains the current route, and searchable tool and article index.
- IP geolocation lookup through a server-side provider adapter (ipapi.co by default; ipwho.is and ip-api.com supported), with optional security classification enrichment.
- CIDR range calculations for IPv4 and IPv6, IPv4-to-IPv6 representations, reverse DNS and a bounded public-host TCP port check.
- Bulk IP lookups with CSV and JSON downloads, and an IP history stored only in browser localStorage.
- Interactive, dynamically loaded Leaflet map; React Query caching; Axios service client; Zod input validation.
- Six original network explainers translated into all supported languages, with FAQs, related tools, article metadata and structured data.
- Localized privacy, terms, disclaimer and cookie pages; contact form validates locally and opens the visitor's email app unless a server webhook is configured.
- Per-route metadata, canonical URLs, hreflang alternates, JSON-LD, robots.txt and language-specific XML sitemaps.

## Tools

1. IP lookup
2. Geolocation map
3. IP range checker
4. Reverse DNS lookup
5. Port scanner (authorized public hosts only; capped to 20 TCP ports)
6. VPN detector (classification depends on available provider data)
7. Proxy checker
8. IPv4 to IPv6 converter
9. Bulk IP checker (up to 50 addresses)
10. IP history (browser local storage only)

## Technology

- Next.js App Router and React with TypeScript strict mode
- Tailwind CSS (project's installed Tailwind 4 integration) plus custom CSS variables
- Lucide React, Leaflet / React-Leaflet, TanStack React Query, Axios, Zod, date-fns, clsx and tailwind-merge
- Server route handlers for GeoIP, reverse DNS, authorized public TCP port checks and optional contact webhooks

## Project layout

```text
src/app/                 App Router pages and route handlers
src/components/           Layout, home, shared and tool components
src/config/               Site, locale and tool configuration
src/data/blog-posts.ts    Localized article content
src/lib/                  i18n, validation, IP network and utility functions
src/services/             Typed API clients
src/types/                Shared application types
locales/                  en.json, ar.json, fr.json
public/                   Brand assets, robots.txt and sitemap files
```

## Run locally

Requirements: Node.js 24.x and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`. Set `NEXT_PUBLIC_SITE_URL` to the canonical deployment origin before release. GeoIP requests use the configured provider and an internet connection. The contact form can use the visitor's default email application; to deliver submissions server-side, configure a trusted `CONTACT_WEBHOOK_URL` endpoint.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used by metadata and JSON-LD |
| `NEXT_PUBLIC_SITE_NAME` | Public site name |
| `IP_GEO_API_PROVIDER` | `ipapi.co` (default), `ipwho.is` or `ip-api.com` |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Optional analytics identifier; analytics is not enabled by default |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Optional analytics feature flag |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact destination shown in the UI |
| `CONTACT_WEBHOOK_URL` | Optional server-only contact delivery endpoint |

The service does not write IP lookups to PostgreSQL or another site database. The Vercel-ready build does not require a database. Search history is held only in localStorage when the browser tool is used. GeoIP and DNS requests are sent to the selected external provider to return requested results.

## SEO and localization

Every public content page is routed under a locale segment and supplies translated metadata, canonical URL and `en`, `ar`, `fr` and `x-default` alternates. Organization, WebSite, WebApplication, SoftwareApplication, BreadcrumbList, FAQPage, Article, HowTo and ItemList structured data are emitted where applicable. `public/sitemap.xml` indexes the three language-specific maps; `public/robots.txt` references the index. Set the canonical host in the sitemap and robots files when deploying to a custom domain.

Arabic pages set `lang="ar"` and `dir="rtl"` from the locale middleware. Layouts use system font stacks with Arabic fallbacks to avoid render-blocking font downloads.

## Deploy to Vercel

1. Import the repository into Vercel; the project is already configured for the Next.js framework and Node.js 24.x.
2. Add the environment variables above for Production, Preview and Development as appropriate. No DATABASE_URL is required.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin and update the sitemap/robots host if using a custom domain.
4. Deploy. The API routes are serverless Node.js handlers; public TCP egress availability depends on the hosting plan/runtime and is intentionally bounded.

## Responsible use and legal note

IP geolocation and proxy/VPN classifications are estimates, not identity or safety guarantees. Port checks are for systems you own or are explicitly authorized to test. Third-party providers have their own retention and privacy terms. Review the localized Privacy, Terms, Disclaimer and Cookie pages before operating the service in a jurisdiction.

## License

MIT. See the `LICENSE` file for the full license text.
