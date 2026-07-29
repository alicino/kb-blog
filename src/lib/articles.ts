import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

const isDev = import.meta.env.DEV;

/** Retorna todos os artigos publicados (ignora rascunhos fora do modo dev), ordenados do mais recente para o mais antigo. */
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getCollection('articles', ({ data }) => isDev || !data.draft);
  return all.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

/** Slug amigável a partir do id do conteúdo (remove extensão/pastas se houver). */
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
  return `/artigos/${article.id}`;
}

export function categoryHref(category: string): string {
  return `/categorias/${slugify(category)}`;
}

export function tagHref(tag: string): string {
  return `/tags/${slugify(tag)}`;
}

export interface CategorySummary {
  name: string;
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

export function describeCategory(name: string): string {
  return CATEGORY_DESCRIPTIONS[name] ?? `Artigos sobre ${name.toLowerCase()}.`;
}

export async function getCategories(): Promise<CategorySummary[]> {
  const articles = await getPublishedArticles();
  const counts = new Map<string, number>();
  for (const article of articles) {
    counts.set(article.data.category, (counts.get(article.data.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      description: describeCategory(name),
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export interface TagSummary {
  name: string;
  slug: string;
  count: number;
}

export async function getTags(): Promise<TagSummary[]> {
  const articles = await getPublishedArticles();
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

/** Tempo estimado de leitura em minutos, baseado em ~200 palavras por minuto. */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateISO(date: Date): string {
  return date.toISOString();
}
