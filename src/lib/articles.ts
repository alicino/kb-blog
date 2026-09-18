import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type Locale = 'pt-br' | 'en';

export const locales: Locale[] = ['pt-br', 'en'];
export const defaultLocale: Locale = 'pt-br';

const isDev = import.meta.env.DEV;

/**
 * O locale de um artigo é derivado do próprio id do Content Layer, não de um
 * campo de frontmatter: arquivos em `src/content/articles/en/<slug>.md` têm
 * id `en/<slug>` (o glob loader já casa subpastas via `**\/[^_]*.{md,mdx}`),
 * enquanto os artigos pt-BR originais continuam soltos na raiz da coleção
 * (id = `<slug>`), exatamente como estavam antes do /en existir — nenhuma
 * URL pt-BR já indexada muda por causa disso.
 */
export function articleLocale(article: Article): Locale {
  return article.id.startsWith('en/') ? 'en' : 'pt-br';
}

/** Slug "puro" do artigo, sem o prefixo de locale — é o que liga a versão
 * pt-BR e a versão en de um mesmo post (ambas usam o mesmo nome de arquivo). */
export function articleSlug(article: Article): string {
  // Artigos EN têm prefixo "en/", artigos PT estão na raiz (sem prefixo).
  return article.id.replace(/^en\//, '');
}

/** Retorna todos os artigos publicados de um locale (ignora rascunhos fora do modo dev), ordenados do mais recente para o mais antigo. */
export async function getPublishedArticles(locale: Locale = defaultLocale): Promise<Article[]> {
  const all = await getCollection(
    'articles',
    (entry) => (isDev || !entry.data.draft) && articleLocale(entry) === locale
  );
  return all.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

/** Dado um artigo, procura a versão traduzida (mesmo slug) no outro locale. */
export async function findTranslation(article: Article, locale: Locale): Promise<Article | null> {
  const slug = articleSlug(article);
  const candidates = await getPublishedArticles(locale);
  return candidates.find((candidate) => articleSlug(candidate) === slug) ?? null;
}

/** Slug amigável a partir de um nome/categoria/tag (independe de locale — é a
 * mesma função de sempre, usada para casar URLs pt-BR e en da mesma entidade). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function articleHref(article: Article): string {
  const locale = articleLocale(article);
  const slug = articleSlug(article);
  return locale === 'en' ? `/en/articles/${slug}` : `/artigos/${slug}`;
}

/** O slug de categoria/tag é sempre derivado do nome canônico (pt-BR, como
 * gravado no frontmatter) em ambos os locales — só o rótulo exibido muda
 * (ver categoryDisplayName). Isso mantém `/categorias/x` e `/en/categories/x`
 * apontando para o mesmo `x`, sem precisar de uma tabela de tradução de slugs. */
export function categoryHref(category: string, locale: Locale = defaultLocale): string {
  const slug = slugify(category);
  return locale === 'en' ? `/en/categories/${slug}` : `/categorias/${slug}`;
}

export function tagHref(tag: string, locale: Locale = defaultLocale): string {
  const slug = slugify(tag);
  return locale === 'en' ? `/en/tags/${slug}` : `/tags/${slug}`;
}

export interface CategorySummary {
  /** Nome canônico, como gravado no frontmatter (sempre pt-BR). */
  name: string;
  /** Rótulo a exibir no locale atual. */
  displayName: string;
  slug: string;
  description: string;
  count: number;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Engenharia: 'Arquitetura de software, boas práticas e decisões técnicas do dia a dia.',
  Ferramentas: 'Aplicativos, bibliotecas e utilitários que tornam o trabalho mais eficiente.',
  Produtividade: 'Fluxos de trabalho, hábitos e formas de organizar o tempo e a atenção.',
  Carreira: 'Reflexões sobre trajetória profissional, aprendizado contínuo e mercado.',
  Design: 'Interfaces, experiência do usuário e o lado visual de construir produtos.',
};

/** Nomes de categoria em inglês. Só existem 10 valores possíveis (enum em
 * content.config.ts), então é uma tabela pequena e fácil de manter. */
const CATEGORY_NAMES_EN: Record<string, string> = {
  Carreira: 'Career',
  Design: 'Design',
  DevOps: 'DevOps',
  Engenharia: 'Engineering',
  Ferramentas: 'Tools',
  'Infraestrutura e Redes': 'Infrastructure & Networking',
  'Inteligência Artificial': 'Artificial Intelligence',
  Produtividade: 'Productivity',
  Redes: 'Networking',
  Segurança: 'Security',
};

const CATEGORY_DESCRIPTIONS_EN: Record<string, string> = {
  Engenharia: 'Software architecture, best practices, and day-to-day technical decisions.',
  Ferramentas: 'Apps, libraries, and utilities that make the work more efficient.',
  Produtividade: 'Workflows, habits, and ways of organizing time and attention.',
  Carreira: 'Reflections on career path, continuous learning, and the job market.',
  Design: 'Interfaces, user experience, and the visual side of building products.',
};

/** Rótulo de categoria no locale atual (o nome canônico permanece pt-BR internamente). */
export function categoryDisplayName(name: string, locale: Locale = defaultLocale): string {
  return locale === 'en' ? (CATEGORY_NAMES_EN[name] ?? name) : name;
}

export function describeCategory(name: string, locale: Locale = defaultLocale): string {
  if (locale === 'en') {
    return CATEGORY_DESCRIPTIONS_EN[name] ?? `Articles about ${categoryDisplayName(name, 'en').toLowerCase()}.`;
  }
  return CATEGORY_DESCRIPTIONS[name] ?? `Artigos sobre ${name.toLowerCase()}.`;
}

export async function getCategories(locale: Locale = defaultLocale): Promise<CategorySummary[]> {
  const articles = await getPublishedArticles(locale);
  const counts = new Map<string, number>();
  for (const article of articles) {
    counts.set(article.data.category, (counts.get(article.data.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      displayName: categoryDisplayName(name, locale),
      slug: slugify(name),
      description: describeCategory(name, locale),
      count,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, locale === 'en' ? 'en' : 'pt-BR'));
}

export interface TagSummary {
  name: string;
  slug: string;
  count: number;
}

/**
 * Tags são texto livre (não um enum fechado como categoria), então não há
 * como traduzir com segurança sem uma tabela mantida à mão — ficam com o
 * mesmo texto em pt-BR e en por enquanto. Só a listagem (quais artigos
 * publicados contam) é filtrada por locale.
 */
export async function getTags(locale: Locale = defaultLocale): Promise<TagSummary[]> {
  const articles = await getPublishedArticles(locale);
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name, locale === 'en' ? 'en' : 'pt-BR'));
}

/** Tempo estimado de leitura em minutos, baseado em ~200 palavras por minuto. */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: Date, locale: Locale = defaultLocale): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateISO(date: Date): string {
  return date.toISOString();
}
