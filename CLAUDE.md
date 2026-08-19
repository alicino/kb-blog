# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # dev server at http://localhost:4321
npm run check     # type-check only (astro check)
npm run build     # astro check && astro build — fails on any type error
npm run preview   # serve the production build from dist/ locally
```

There is no test suite and no linter configured in this project. `npm run check` (via `astro check`, backed by `@astrojs/check` + TypeScript strict mode) is the only automated verification step, and it is also run as part of `npm run build`.

To verify a single page/route after a change, it's faster to `npm run dev` and curl/open the specific path than to run a full build.

## Architecture

Astro 7 (static output, no server adapter), TypeScript strict, no UI framework (no React/Vue/etc.) — every interactive piece is a small vanilla-JS `<script>` inside an `.astro` component. Content lives in Markdown via the Content Layer API.

### Routing has an intentional split between pagination and slugs

Individual articles live at `/artigos/[slug].astro`. Numbered pagination for the articles listing deliberately lives at `/artigos/pagina/[page].astro` (a nested `pagina` segment), **not** at `/artigos/[page].astro`. This is to avoid any ambiguity between a numeric page param and an article slug living in the same directory. The home page has no such conflict, so it follows the more conventional `src/pages/index.astro` (page 1) + `src/pages/[page].astro` (page 2+) split.

Both pagination points use a hand-rolled `paginate()` helper (`src/lib/paginate.ts`) instead of Astro's built-in `paginate()` global. Astro's built-in helper is only injected inside `getStaticPaths()`, but `index.astro` (page 1) is a plain static route with no `getStaticPaths`, so it has no access to it. Using one custom helper everywhere keeps the `Paginated<T>` shape (and the `Pagination.astro` component that renders it) consistent across the home page and `/artigos`, regardless of which file is static vs. dynamic. `Pagination.astro` takes explicit `firstPageHref` and `pagePathPrefix` props rather than deriving them from a URL, precisely because of the `/artigos` vs. `/artigos/pagina` split above.

Categories and tags follow the standard index + `[slug].astro` pattern (`/categorias`, `/categorias/[category]`, `/tags`, `/tags/[tag]`). Slugs for categories/tags are derived at read time via `slugify()` in `src/lib/articles.ts` — there is no separate stored slug field in frontmatter.

### Content collection

Single collection, `articles`, defined in `src/content.config.ts` using the `glob()` loader (Content Layer API — schema validated with Zod). Frontmatter contract: `title`, `description`, `publishDate`, `updatedDate?`, `author`, `category`, `tags[]`, `draft`, plus optional `cover`/`coverAlt` (validated via the `image()` schema helper — resolved relative to the article's own file, so a cover image is expected to live alongside its `.md`/`.mdx` file, per the convention documented in `README.md` under "Onde colocar imagens" — currently unused by any template, kept for future use). `draft: true` articles are excluded from every listing, the RSS feed, and the search index in production builds, but remain visible in `npm run dev` — this is handled by the `isDev` check in `getPublishedArticles()` (`src/lib/articles.ts`), not by a build flag, so don't rely on `draft` articles being invisible while developing.

All article queries funnel through `src/lib/articles.ts` (`getPublishedArticles`, `getCategories`, `getTags`, plus href helpers `articleHref`/`categoryHref`/`tagHref`). Prefer adding new query logic there rather than calling `getCollection('articles', ...)` directly from a page, so the draft-filtering and sort order stay centralized.

Rendering an entry's body uses the Content Layer's `render(entry)` import from `astro:content` (not `entry.render()` — that method doesn't exist on glob-loader entries).

### Mermaid diagrams

Fenced ```mermaid code blocks are rendered to inline SVG **at build time** by a custom rehype plugin (`plugins/rehype-mermaid.mjs`, registered in `markdown.rehypePlugins` in `astro.config.mjs`). It uses `mermaid-isomorphic`, which drives a headless Playwright Chromium — so building (and `npm run dev`, which renders Markdown on demand) requires the browser to be installed once via `npx playwright install chromium`; the deploy workflow installs it explicitly before `astro build`. Each diagram is rendered twice (light + dark variants with distinct id prefixes to avoid embedded-`<style>` collisions) and `global.css` toggles which one is visible based on `data-theme` — no Mermaid JavaScript ships to the browser. The plugin runs before Expressive Code's rehype plugin (integration-injected plugins run after `markdown.rehypePlugins`), so EC never sees `mermaid` blocks and all other code fences keep their syntax highlighting. Note the Content Layer caches rendered Markdown in `.astro/` and `node_modules/.astro/`; changes to the plugin/config don't invalidate it, so delete those caches to force re-rendering.

### Links data

`/links` reads from `src/data/links.json` (a plain JSON array of `{ group, links: [{ label, url, description }] }`), imported directly in `src/pages/links.astro` via Vite's JSON module support (`resolveJsonModule` is set in `tsconfig.json`). This was deliberately split out of `site.config.ts` into its own JSON file so it can be edited (add/remove/reorder entries) without touching TypeScript syntax — everything else editorial/structural still lives in `site.config.ts`.

### Search

`src/pages/search-index.json.ts` is a prerendered API route that builds one flat JSON array of `SearchDoc` (articles + categories + tags + a handful of hardcoded institutional pages) at build time. `src/components/SearchBox.astro` lazy-fetches this JSON on first input focus and does all filtering/scoring/keyboard-nav client-side — there's no server-side search and no third-party search service (no Pagefind, no Algolia). `src/lib/search.ts` holds the shared `normalize()` (accent/case-insensitive) and `stripMarkdown()` helpers; the client script in `SearchBox.astro` imports directly from it, so that file is bundled per-page by Vite, not hand-duplicated.

### Site-wide config lives in one file

`src/site.config.ts` is the single source of truth for blog name, tagline, author, nav/footer links, socials, `articlesPerPage`, and the `linkGroups` shown on `/links`. Changing branding/copy should touch this file, not the components. `astro.config.mjs` imports `siteConfig.url` for the `site` field (used by canonical URLs, sitemap, RSS) — if the production domain changes, it needs to be updated in both `site.config.ts` and implicitly reflected wherever `astro.config.mjs` reads from it (it re-imports the same constant, so in practice only one edit is needed).

### Layout and design tokens

`src/layouts/BaseLayout.astro` is the only layout; every page wraps its content in `<div class="page-shell"><div class="surface surface-inner">...</div></div>` — this produces the global centered-card look (grey page background, white rounded card) and should be reused rather than reimplemented per page. `src/styles/global.css` holds all design tokens as CSS custom properties (colors, spacing, radii, shadows) plus a dark theme override under `:root[data-theme='dark']` and the `.prose` class used specifically for rendered Markdown body content in `/artigos/[slug].astro` and `about.astro`. Theme switching is done by `ThemeToggle.astro` toggling `data-theme` on `<html>` and persisting to `localStorage`; `BaseLayout.astro` has an inline (non-module) script in `<head>` that reads that value before paint to avoid a flash of the wrong theme.

Fonts are self-hosted via `@fontsource/*` packages (Fraunces for display/headings, Literata for article body copy, Inter for UI chrome/nav/metadata) imported at the top of `global.css` — there are no external font CDN requests.

### SEO

`src/components/SEO.astro` centralizes `<title>`, meta description, canonical URL, Open Graph/Twitter tags, and JSON-LD (`BlogPosting` for articles, `WebSite` otherwise) — every page should render this once via `BaseLayout`'s props rather than writing `<title>`/meta tags directly. `astro.config.mjs` filters the `@astrojs/sitemap` output to exclude `/404`, `search-index.json`, and `robots.txt`.
