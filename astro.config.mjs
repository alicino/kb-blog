// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { siteConfig } from './src/site.config.ts';

export default defineConfig({
  site: siteConfig.url,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/404') && !page.endsWith('search-index.json') && !page.endsWith('robots.txt'),
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
});
