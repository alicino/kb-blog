/**
 * Configuração central do blog.
 *
 * Edite este arquivo para alterar nome, logo, descrição, autor,
 * redes sociais, paginação e informações de copyright.
 * Nenhuma outra parte do código deveria precisar ser tocada para
 * essas mudanças básicas de identidade.
 *
 * Os links recomendados exibidos em /links ficam num arquivo separado,
 * `src/data/links.json`, propositalmente em JSON (e não aqui) para serem
 * fáceis de editar, inserir e remover sem tocar em código TypeScript.
 */

export interface SocialLink {
  label: string;
  url: string;
  icon: 'github' | 'twitter' | 'linkedin' | 'mastodon' | 'rss' | 'email';
}

export interface ExternalLink {
  label: string;
  url: string;
}

export const siteConfig = {
  /** Nome exibido na navbar, footer e metadados. */
  name: 'knowledge base',

  /**
   * Frase de destaque em duas linhas, exibida em fonte grande logo abaixo da
   * navbar na Home. `bold` é renderizado em negrito, `italic` em itálico.
   */
  headline: {
    bold: 'Curiosidade,',
    italic: 'documentada.',
  },

  /** Parágrafo curto exibido logo abaixo da frase de destaque na Home. */
  tagline:
    'Um arquivo pessoal sobre inteligência artificial, tecnologia e tudo o que vale a pena aprender com calma.',

  /** URL canônica de produção do blog (sem barra final). */
  url: 'https://campoaberto.exemplo.com',

  /** Usado em meta description padrão, RSS e JSON-LD. */
  description:
    'Um blog pessoal sobre engenharia de software, ferramentas de produtividade e aprendizados ao longo do caminho.',

  /** Caminho do logo dentro de /public, ou null para usar apenas o nome em texto. */
  logo: null as string | null,

  author: {
    name: 'Alicino',
    email: 'alicino@gmail.com',
    bio: 'Desenvolvedor(a) e escritor(a), interessado em construir ferramentas simples e bem pensadas.',
    avatar: null as string | null,
  },

  /** Quantidade de artigos exibidos por página nas listagens paginadas. */
  articlesPerPage: 6,

  /** Redes sociais exibidas no footer. Remova itens que não se aplicam. */
  socials: [
    { label: 'GitHub', url: 'https://github.com/', icon: 'github' },
    { label: 'RSS', url: '/rss.xml', icon: 'rss' },
  ] satisfies SocialLink[],

  /** Links institucionais extras no footer, além das redes sociais. */
  footerLinks: [
    { label: 'Sobre', url: '/about' },
    { label: 'Links', url: '/links' },
    { label: 'RSS', url: '/rss.xml' },
  ] satisfies ExternalLink[],

  /** Ano de início do copyright. O ano final é sempre o atual, calculado automaticamente. */
  copyrightStartYear: 2024,
};

export type SiteConfig = typeof siteConfig;
