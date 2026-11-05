# PrintPressRepeat — Next.js conversion

This is your React (Vite + react-router-dom) site, converted to **Next.js 16 (App Router, TypeScript)**.

## Get started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # run the production build
```

## What changed

- **Routing**: `react-router-dom` → Next.js file-based routing in `src/app/`.
  Dynamic promotional product routes (`/promotional-products/:slug`) use
  `[slug]/page.tsx`, with `generateStaticParams` and `generateMetadata`.
- **SEO**: the old `useSeo()` hook (which set `document.title` client-side) is gone.
  Every page now exports proper Next.js `metadata` (or `generateMetadata` for dynamic
  routes), which is far better for SEO since it's rendered server-side.
- **Invalid slugs**: previously used `<Navigate>`; now use Next's server-side `redirect()`.
- **Styling**: Tailwind v4. Your original `tailwind.config.js` theme (colors, shadows,
  fonts, animations) was preserved as `tailwind.config.ts`, loaded via Tailwind v4's
  `@config` compatibility directive in `src/app/globals.css` — no need to hand-migrate
  every token.
- **Fonts**: Google Fonts (Sora, Inter) now load via `next/font/google` in
  `src/app/layout.tsx` instead of a CSS `@import` — this avoids render-blocking font
  requests.
- **Client vs. server components**: files using hooks, `framer-motion`, `react-hook-form`,
  or `react-dropzone` are marked `'use client'`. Page files that don't need interactivity
  themselves stay as server components so they can export `metadata`. The Contact page
  separates its server-rendered metadata from the interactive form.
- **Page transitions / scroll-to-top**: reproduced via `src/app/template.tsx`, which
  remounts on every navigation (fades content in and resets scroll), replacing the old
  `AnimatePresence` + `ScrollToTop` combo in `App.tsx`.
- **Images**: assets moved to `/public` and referenced by plain string paths (e.g.
  `/images/bussinessCard.webp`) instead of bundler imports, so existing `<img>`
  usage needed no further changes. You can swap these for `next/image` later for
  automatic optimization if you want.
- **Route renames** (for cleaner URLs): `/privacyPolicy` → `/privacy-policy` and
  `/term&condition` → `/terms`. Footer/nav links were updated to match.

## Verified

Run `npm run build` to validate the production build and generated routes.

## Deploying

This is ready to deploy as-is on Vercel, or any Node hosting that supports
`next build && next start`.
