# Public design and SEO verification

- Cream/forest-green header with mint active states, readable dropdowns, keyboard focus and mobile navigation. Dark mode has its own contrast rules.
- All information pages share a breadcrumb hero, content card, related links and footer. Default long-form text is divided into readable sections. Published CMS HTML remains sanitized.
- Home plus 27 default destinations have generated HTML with readable content, a unique title/description, canonical, Open Graph, Twitter metadata, WebPage and breadcrumb schema. Organization schema remains in the base document.
- Build generates robots.txt and sitemap.xml, with account routes excluded from indexing. Runtime metadata follows CMS edits.
- Optional build environment: `PUBLIC_API_URL=https://your-backend/api` includes published CMS pages and blog posts in the build snapshot and sitemap. `VITE_PUBLIC_SITE_URL` sets the canonical site origin. Rebuild after CMS edits to update pre-rendered snapshots. Without PUBLIC_API_URL the build uses default page content; CMS changes still render dynamically.
- Verification: production build passed; 28 generated SEO documents checked for metadata/schema; 30 public/account routes passed Chrome loading checks; desktop/mobile screenshots reviewed. Two-page PDF branding check also passed.

These checks confirm local implementation and output. Deployment and search-engine indexing have not been performed.
