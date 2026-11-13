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
  // As URLs de categoria em inglês eram geradas a partir do nome canônico
  // pt-BR (`/en/categories/inteligencia-artificial`). Passaram a usar o nome
  // traduzido (`/en/categories/artificial-intelligence`), que é o certo para
  // quem lê em inglês. Estas entradas preservam as URLs antigas, que já estão
  // no sitemap e podem estar indexadas. Só as categorias cujo nome muda no
  // inglês aparecem aqui; design e devops são iguais nos dois idiomas.
  //
  // GitHub Pages é estático: o Astro emite uma página com <meta refresh> em
  // vez de um 301 real. Funciona para o visitante; para buscadores é um sinal
  // mais fraco que um 301, mas melhor que um 404.
  redirects: {
    '/en/categories/carreira': '/en/categories/career',
    '/en/categories/engenharia': '/en/categories/engineering',
    '/en/categories/ferramentas': '/en/categories/tools',
    '/en/categories/infraestrutura-e-redes': '/en/categories/infrastructure-networking',
    '/en/categories/inteligencia-artificial': '/en/categories/artificial-intelligence',
    '/en/categories/produtividade': '/en/categories/productivity',
    '/en/categories/redes': '/en/categories/networking',
    '/en/categories/seguranca': '/en/categories/security',
    // Artigos EN tinham o slug em português (o HTML era inglês, o endereço não).
    // O slug passou a ser traduzido; estas entradas preservam as URLs antigas,
    // que já estão no sitemap. Mesma ressalva das categorias: estático, então
    // vira <meta refresh> em produção, não um 301 real.
    '/en/articles/2026-07-30-cloudflare-workers-ai-free-tier': '/en/articles/2026-07-30-free-llms-cloudflare-workers-ai',
    '/en/articles/2026-07-30-docker-para-desenvolvedores-iniciantes': '/en/articles/2026-07-30-docker-for-beginner-developers',
    '/en/articles/2026-08-07-gitignore-guia-completo': '/en/articles/2026-08-07-gitignore-guide-fixing-mistakes',
    '/en/articles/2026-08-31-sase-zero-trust-network-security-cloud': '/en/articles/2026-08-31-sase-zero-trust-cloud-security',
    '/en/articles/2026-08-31-second-brain-ai-complete-guide': '/en/articles/2026-08-31-second-brain-with-ai-complete-guide',
    '/en/articles/2026-09-02-pocket-id-passkeys-complete-guide': '/en/articles/2026-09-02-pocket-id-passkeys-passwordless-auth',
    '/en/articles/2026-09-02-vlan-seguranca-rede-tudo-junto-nada-misturado': '/en/articles/2026-09-02-vlan-network-segmentation',
    '/en/articles/2026-09-04-ataque-agentes-openai-hugging-face': '/en/articles/2026-09-04-openai-agents-hugging-face-attack',
    '/en/articles/2026-09-12-fine-tuning-ia-para-iniciantes-glossario': '/en/articles/2026-09-12-ai-fine-tuning-glossary-beginners',
    '/en/articles/2026-09-14-skillspector-antivirus-ia-agent-skills': '/en/articles/2026-09-14-skillspector-antivirus-ai-agent-skills',
    '/en/articles/2026-09-16-criar-sua-propria-skill-agentes-ia': '/en/articles/2026-09-16-create-your-own-ai-agent-skill',
    '/en/articles/2026-09-20-btop-monitor-recursos-terminal': '/en/articles/2026-09-20-btop-system-resource-monitor',
    '/en/articles/2026-09-21-ssh-chaves-servidor-seguro': '/en/articles/2026-09-21-ssh-public-key-authentication',
    '/en/articles/2026-09-25-qemu-kvm-vms-linux': '/en/articles/2026-09-25-qemu-kvm-virtual-machines-linux',
    '/en/articles/2026-09-28-abliteration-recusa-llm': '/en/articles/2026-09-28-abliteration-llm-refusal',
    '/en/articles/2026-10-06-cloudflare-security-audit-skill': '/en/articles/2026-10-06-cloudflare-ai-agent-security-auditor',
    '/en/articles/2026-10-09-ip-pais-asn-bgp': '/en/articles/2026-10-09-ip-ownership-iana-rirs-asn-bgp-part-1',
    '/en/articles/2026-10-10-deteccao-vpn-hosting-asn': '/en/articles/2026-10-10-vpn-detection-hosting-asn-part-2',
    '/en/articles/2026-10-16-como-funciona-a-rede-tor': '/en/articles/2026-10-16-how-the-tor-network-works',
    '/en/articles/2026-10-16-cve-pwnescape': '/en/articles/2026-10-16-cve-pwnescape-vm-host-escape',
    '/en/articles/2026-10-19-rpki-rotas-assinadas': '/en/articles/2026-10-19-rpki-signed-routes',
    '/en/articles/2026-11-01-segundo-cerebro-parte-2-cultivar-conhecimento': '/en/articles/2026-11-01-second-brain-ai-part-2-cultivating-knowledge',
    '/en/articles/2026-11-11-ia-para-quem-nao-usa-parte-1': '/en/articles/2026-11-11-ai-for-people-who-dont-use-ai-part-1',
    '/en/articles/2026-11-12-ia-para-quem-nao-usa-parte-2': '/en/articles/2026-11-12-ai-for-people-who-dont-use-ai-part-2',
    '/en/articles/2026-11-13-ia-para-quem-nao-usa-parte-3': '/en/articles/2026-11-13-ai-for-people-who-dont-use-ai-part-3',
    '/en/articles/agentes-ia-autonomos-trabalho': '/en/articles/autonomous-ai-agents-build-in-your-favor',
    '/en/articles/agentes-ia-e-loop-engineering': '/en/articles/ai-agents-loop-engineering-guide',
    '/en/articles/cloudflare-os-sistema-operacional-aberto': '/en/articles/cloudflare-os-open-source',
    '/en/articles/custo-real-llm-local': '/en/articles/real-cost-running-llms-locally-2026',
    '/en/articles/dns-criptografado-doh-dot-doq-doh3-odoh': '/en/articles/encrypted-dns-doh-dot-doq-explained',
    '/en/articles/escrevendo-css-sustentavel': '/en/articles/writing-css-that-lasts',
    '/en/articles/ferramentas-que-uso-todo-dia': '/en/articles/tools-i-use-every-day',
    '/en/articles/github-actions-cicd-gratuito': '/en/articles/github-actions-free-cicd',
    '/en/articles/licoes-dos-primeiros-anos-de-carreira': '/en/articles/early-career-lessons',
    '/en/articles/o-mito-da-produtividade-constante': '/en/articles/myth-of-constant-productivity',
    '/en/articles/produtividade-sem-otimizacao-toxica': '/en/articles/productivity-without-toxic-optimization',
    '/en/articles/terminal-produtivo-em-2026': '/en/articles/productive-terminal-2026',
    '/en/articles/testando-em-producao-com-seguranca': '/en/articles/testing-changes-in-production-safely',
    '/en/articles/tipografia-para-leitura-longa': '/en/articles/typography-for-long-form-reading',
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
