import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedArticles, articleHref, categoryDisplayName } from '../../lib/articles';
import { siteConfig } from '../../site.config';

export const prerender = true;

export async function GET(context: APIContext) {
  const articles = await getPublishedArticles('en');

  return rss({
    title: siteConfig.name,
    description:
      'A personal archive about artificial intelligence, technology, and everything worth learning slowly.',
    site: context.site ?? siteConfig.url,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishDate,
      link: articleHref(article),
      categories: [categoryDisplayName(article.data.category, 'en'), ...article.data.tags],
      author: article.data.author,
    })),
    customData: `<language>en</language>`,
  });
}
