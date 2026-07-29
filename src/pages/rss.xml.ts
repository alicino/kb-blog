import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedArticles, articleHref } from '../lib/articles';
import { siteConfig } from '../site.config';

export const prerender = true;

export async function GET(context: APIContext) {
  const articles = await getPublishedArticles();

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site ?? siteConfig.url,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishDate,
      link: articleHref(article),
      categories: [article.data.category, ...article.data.tags],
      author: article.data.author,
    })),
    customData: `<language>pt-br</language>`,
  });
}
