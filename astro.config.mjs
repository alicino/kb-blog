// @ts-check
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { siteConfig } from './src/site.config.ts';
import rehypeMermaid from './plugins/rehype-mermaid.mjs';

export default defineConfig({
  site: siteConfig.url,
  // pt-BR continua sem prefixo (URLs já indexadas, ex. /artigos/slug);
  // inglês entra prefixado em /en (/en/articles/slug etc.).
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    // remark-math habilita $inline$ e $$bloco$$; rehype-katex converte em HTML
    // com MathML embutido, o que mantém a acessibilidade para leitor de tela.
    // O import do CSS do KaTeX fica em src/styles/global.css.
    remarkPlugins: [remarkMath],
    // Roda antes do rehype plugin do Expressive Code (plugins de integrações
    // são anexados depois destes) — só os fences ```mermaid são consumidos.
    rehypePlugins: [rehypeKatex, rehypeMermaid],
  },
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
    }),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'pt-br',
        locales: { 'pt-br': 'pt-BR', en: 'en-US' },
      },
      filter: (page) =>
        !page.includes('/404') &&
        !page.endsWith('search-index.json') &&
        !page.endsWith('robots.txt'),
    }),
  ],
});
