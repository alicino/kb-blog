// @ts-check
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { siteConfig } from './src/site.config.ts';

export default defineConfig({
  site: siteConfig.url,
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
    }),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/404') &&
        !page.endsWith('search-index.json') &&
        !page.endsWith('robots.txt'),
    }),
  ],
});
