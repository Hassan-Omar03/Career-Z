# Public website, branding, classroom lifecycle and file recovery

Implemented locally on 2026-10-09.

## Public website

Home now includes platform discovery, role descriptions and onboarding steps. Twenty-seven public routes cover the master document's default information pages and platform/program destinations. A shared responsive forest-green footer links every default destination and includes the contact information supplied in the reference.

Published CMS page content and SEO titles/descriptions override baseline public content. Blog reads published posts. Institutions, courses, jobs and scholarships show public API listings with search, loading, empty and retry states. CMS HTML is sanitized before rendering.

Each default information route receives build-time HTML containing its title, description, canonical URL, social sharing metadata and readable baseline content. Runtime metadata follows published CMS edits. Sitemap, robots rules and Organization/WebPage structured data are included. Account entry pages have noindex metadata.

The generated static sitemap covers default routes; custom CMS pages and blog posts use the dynamic frontend. Build-time baseline HTML does not automatically include subsequently edited CMS text.

## Branding

Original `public/logo2.png` is retained on light backgrounds. `public/brand/logo-dark.png` is a transparent white/mint/gold variant for dark and green backgrounds. Both use contain sizing, including the full emblem, wordmark and tagline.

Shared branding covers home, public/auth headers, login/signup, dashboard header/sidebar and footer. Shared PDF exports include the full logo, including continuation pages; offline certificates and presentation PDFs are also covered. The service worker caches both variants for offline use.

## Verification

- Isolated backend: 6/6 classroom lifecycle and file recovery tests pass. Tests verify scheduled session ownership, attendance linkage, engagement on end, binary backup/re-upload/reference replacement and corrupt backup rejection.
- Frontend API tests: 5/5 pass.
- Chrome browser: all 27 default public routes, Home, Login and Signup load their footer and logo images (30 routes). Mobile footer screenshot captured.
- Browser PDF: a two-page branded PDF generated successfully with the logo attached.
- Production build and all 27 generated SEO page assertions pass.

Backend checks use temporary databases and mocked file-provider calls. They verify implementation behavior; they do not constitute restoration of a production cloud file. Existing production records were not edited by these tests. Changes have not been deployed.

Evidence: `audit/public-about-mobile.png`, `audit/brand-verification.pdf`, `audit/public-pages-browser.cjs`.
