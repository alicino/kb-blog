/**
 * Strings de UI (não-conteúdo) usadas nas páginas e componentes
 * compartilhados, uma entrada por locale. Conteúdo dos artigos em si (título,
 * corpo, descrição) vem do frontmatter/markdown de cada arquivo — isto aqui é
 * só o "chrome" ao redor: navegação, rótulos, mensagens de estado vazio etc.
 */
import type { Locale } from './articles';
import { siteConfig } from '../site.config';

export type { Locale };

/** Tag `lang` do `<html>` e usado em `Intl`/`hreflang`. */
export const htmlLang: Record<Locale, string> = {
  'pt-br': 'pt-BR',
  en: 'en',
};

interface Dictionary {
  common: {
    pageLabel: (page: number) => string;
    toggleTheme: string;
  };
  nav: {
    home: string;
    articles: string;
    about: string;
    links: string;
    categories: string;
    tags: string;
    ariaLabel: string;
    openMenu: string;
  };
  home: {
    recentArticles: string;
    pageSuffix: (page: number) => string;
    heroBold: string;
    heroItalic: string;
    heroTagline: string;
    editorialTitle: string;
    editorialParagraphs: string[];
  };
  articlesIndex: {
    title: string;
    pageTitle: (page: number) => string;
    countLabel: (count: number) => string;
    breadcrumb: string;
  };
  article: {
    breadcrumbHome: string;
    breadcrumbArticles: string;
    byAuthor: (author: string) => string;
    publishedOn: string;
    updatedOn: string;
    readingTime: (minutes: number) => string;
    prevArticle: string;
    nextArticle: string;
    backToArticles: string;
  };
  categories: {
    title: string;
    countLabel: (count: number) => string;
  };
  category: {
    eyebrow: string;
    breadcrumb: string;
  };
  tags: {
    title: string;
    countLabel: (count: number) => string;
  };
  tag: {
    eyebrow: string;
    countLabel: (count: number) => string;
    breadcrumb: string;
  };
  pagination: {
    ariaLabel: string;
    prev: string;
    next: string;
    prevAria: string;
    nextAria: string;
  };
  breadcrumbs: {
    ariaLabel: string;
  };
  footer: {
    rights: (yearLabel: string, author: string) => string;
    ariaLabel: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    description: string;
    backHome: string;
    viewArticles: string;
  };
  search: {
    label: string;
    placeholder: string;
    noResults: (query: string) => string;
    typeLabels: Record<'article' | 'pagina' | 'categoria' | 'tag', string>;
    resultsAriaLabel: string;
  };
  languageSwitch: {
    label: string;
    switchToLabel: string;
  };
  skipToContent: string;
}

const dictionaries: Record<Locale, Dictionary> = {
  'pt-br': {
    common: {
      pageLabel: (page) => `Página ${page}`,
      toggleTheme: 'Alternar tema claro/escuro',
    },
    nav: {
      home: 'Home',
      articles: 'Artigos',
      about: 'Sobre',
      links: 'Links',
      categories: 'Categorias',
      tags: 'Tags',
      ariaLabel: 'Navegação principal',
      openMenu: 'Abrir menu',
    },
    home: {
      recentArticles: 'Artigos recentes',
      pageSuffix: (page) => ` — página ${page}`,
      // pt-BR é o locale default: a fonte única de verdade do hero continua
      // sendo site.config.ts (é o que o comentário no topo daquele arquivo promete
      // a quem for editar nome/tagline do blog). O dicionário en abaixo é uma
      // tradução mantida à mão — se a tagline pt-BR mudar, atualize a en também.
      heroBold: siteConfig.headline.bold,
      heroItalic: siteConfig.headline.italic,
      heroTagline: siteConfig.tagline,
      editorialTitle: 'Entre humanos, máquinas e perguntas',
      editorialParagraphs: [
        'Este blog é um laboratório público, criado no encontro entre experiência humana, curiosidade e inteligência artificial. Aqui, eu e o Hermes exploramos tecnologia, infraestrutura, segurança, inteligência artificial e ideias que merecem sair do rascunho. Cada artigo nasce de uma pergunta, passa por pesquisa, experimentação e revisão, e permanece aberto a novas descobertas. Não buscamos respostas definitivas, porque a tecnologia muda, o conhecimento evolui e certezas envelhecem.',
        'Preferimos perguntas capazes de continuar trabalhando, provocar conexões e revelar novos caminhos. Entre, explore, questione e volte sempre: o próximo experimento talvez comece justamente com uma pergunta que você ainda nem imaginou que faria.',
      ],
    },
    articlesIndex: {
      title: 'Artigos',
      pageTitle: (page) => `Artigos · Página ${page}`,
      countLabel: (count) => `${count} artigo${count === 1 ? '' : 's'} publicado${count === 1 ? '' : 's'}`,
      breadcrumb: 'Artigos',
    },
    article: {
      breadcrumbHome: 'Home',
      breadcrumbArticles: 'Artigos',
      byAuthor: (author) => `Por ${author}`,
      publishedOn: 'Publicado em',
      updatedOn: 'Atualizado em',
      readingTime: (minutes) => `${minutes} min de leitura`,
      prevArticle: '← Artigo anterior',
      nextArticle: 'Próximo artigo →',
      backToArticles: '← Voltar para todos os artigos',
    },
    categories: {
      title: 'Categorias',
      countLabel: (count) => `${count} categoria${count === 1 ? '' : 's'}`,
    },
    category: {
      eyebrow: 'Categoria',
      breadcrumb: 'Categorias',
    },
    tags: {
      title: 'Tags',
      countLabel: (count) => `${count} tags`,
    },
    tag: {
      eyebrow: 'Tag',
      countLabel: (count) => `${count} artigo${count === 1 ? '' : 's'}`,
      breadcrumb: 'Tags',
    },
    pagination: {
      ariaLabel: 'Paginação de artigos',
      prev: '← Anterior',
      next: 'Próxima →',
      prevAria: 'Página anterior',
      nextAria: 'Próxima página',
    },
    breadcrumbs: {
      ariaLabel: 'Trilha de navegação',
    },
    footer: {
      rights: (yearLabel, author) => `© ${yearLabel} ${author}. Todos os direitos reservados.`,
      ariaLabel: 'Links do rodapé',
    },
    notFound: {
      eyebrow: 'Erro 404',
      title: 'Essa página não existe',
      description:
        'O endereço acessado pode ter sido movido, renomeado ou nunca ter existido. Que tal voltar para um lugar conhecido?',
      backHome: 'Voltar para a Home',
      viewArticles: 'Ver todos os artigos',
    },
    search: {
      label: 'Buscar no blog',
      placeholder: 'Buscar artigos, tags, categorias…',
      noResults: (query) => `Nenhum resultado encontrado para "${query}".`,
      typeLabels: { article: 'Artigo', pagina: 'Página', categoria: 'Categoria', tag: 'Tag' },
      resultsAriaLabel: 'Resultados da busca',
    },
    languageSwitch: {
      label: 'EN',
      switchToLabel: 'Read in English',
    },
    skipToContent: 'Pular para o conteúdo',
  },
  en: {
    common: {
      pageLabel: (page) => `Page ${page}`,
      toggleTheme: 'Toggle light/dark theme',
    },
    nav: {
      home: 'Home',
      articles: 'Articles',
      about: 'About',
      links: 'Links',
      categories: 'Categories',
      tags: 'Tags',
      ariaLabel: 'Main navigation',
      openMenu: 'Open menu',
    },
    home: {
      recentArticles: 'Recent articles',
      pageSuffix: (page) => ` — page ${page}`,
      heroBold: 'Curiosity,',
      heroItalic: 'documented.',
      heroTagline:
        'A personal archive about artificial intelligence, technology, and everything worth learning slowly.',
      editorialTitle: 'Between humans, machines, and questions',
      editorialParagraphs: [
        'This blog is a public laboratory, born where human experience, curiosity, and artificial intelligence meet. Here, Hermes and I explore technology, infrastructure, security, artificial intelligence, and ideas that deserve to leave the draft stage. Every article starts as a question, goes through research, experimentation, and revision, and stays open to new discoveries. We are not chasing definitive answers, because technology changes, knowledge evolves, and certainties age.',
        'We prefer questions that keep working, spark connections, and reveal new paths. Come in, explore, ask, and come back: the next experiment might start with a question you have not even thought to ask yet.',
      ],
    },
    articlesIndex: {
      title: 'Articles',
      pageTitle: (page) => `Articles · Page ${page}`,
      countLabel: (count) => `${count} article${count === 1 ? '' : 's'} published`,
      breadcrumb: 'Articles',
    },
    article: {
      breadcrumbHome: 'Home',
      breadcrumbArticles: 'Articles',
      byAuthor: (author) => `By ${author}`,
      publishedOn: 'Published on',
      updatedOn: 'Updated on',
      readingTime: (minutes) => `${minutes} min read`,
      prevArticle: '← Previous article',
      nextArticle: 'Next article →',
      backToArticles: '← Back to all articles',
    },
    categories: {
      title: 'Categories',
      countLabel: (count) => `${count} categor${count === 1 ? 'y' : 'ies'}`,
    },
    category: {
      eyebrow: 'Category',
      breadcrumb: 'Categories',
    },
    tags: {
      title: 'Tags',
      countLabel: (count) => `${count} tags`,
    },
    tag: {
      eyebrow: 'Tag',
      countLabel: (count) => `${count} article${count === 1 ? '' : 's'}`,
      breadcrumb: 'Tags',
    },
    pagination: {
      ariaLabel: 'Article pagination',
      prev: '← Previous',
      next: 'Next →',
      prevAria: 'Previous page',
      nextAria: 'Next page',
    },
    breadcrumbs: {
      ariaLabel: 'Breadcrumb',
    },
    footer: {
      rights: (yearLabel, author) => `© ${yearLabel} ${author}. All rights reserved.`,
      ariaLabel: 'Footer links',
    },
    notFound: {
      eyebrow: 'Error 404',
      title: 'This page does not exist',
      description:
        'The address you tried may have been moved, renamed, or never existed. How about heading somewhere familiar?',
      backHome: 'Back to Home',
      viewArticles: 'View all articles',
    },
    search: {
      label: 'Search the blog',
      placeholder: 'Search articles, tags, categories…',
      noResults: (query) => `No results found for "${query}".`,
      typeLabels: { article: 'Article', pagina: 'Page', categoria: 'Category', tag: 'Tag' },
      resultsAriaLabel: 'Search results',
    },
    languageSwitch: {
      label: 'PT',
      switchToLabel: 'Ler em português',
    },
    skipToContent: 'Skip to content',
  },
};

export function t(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Adapta `siteConfig.footerLinks` (fonte única de verdade — é lá que quem
 * edita o blog adiciona/remove links do rodapé) para o locale atual: prefixa
 * cada URL com /en e traduz os rótulos conhecidos (Sobre/Links). Um link
 * customizado que o usuário adicionar em site.config.ts continua aparecendo
 * em inglês também (só sem tradução do rótulo), em vez de sumir.
 */
export function localizedFooterLinks(
  locale: Locale,
  links: { label: string; url: string }[]
): { label: string; url: string }[] {
  if (locale === 'pt-br') return links;
  const dict = t(locale);
  const labelMap: Record<string, string> = {
    Sobre: dict.nav.about,
    Links: dict.nav.links,
  };
  return links.map((link) => ({
    label: labelMap[link.label] ?? link.label,
    url: `/en${link.url}`,
  }));
}

/** Caminho da versão no outro locale, para o seletor de idioma da navbar —
 * link "genérico" (home/listagem do outro idioma), sem depender de existir
 * uma tradução do artigo/página atual. */
export function otherLocaleHome(locale: Locale): { locale: Locale; href: string } {
  return locale === 'en' ? { locale: 'pt-br', href: '/' } : { locale: 'en', href: '/en' };
}
