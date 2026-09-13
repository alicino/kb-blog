import type { APIRoute } from 'astro';
import { getPublishedArticles, getCategories, getTags, articleHref, categoryHref, categoryDisplayName, tagHref } from '../../lib/articles';
import { stripMarkdown, type SearchDoc } from '../../lib/search';

export const prerender = true;

export const GET: APIRoute = async () => {
  const locale = 'en' as const;
  const articles = await getPublishedArticles(locale);
  const categories = await getCategories(locale);
  const tags = await getTags(locale);

  const docs: SearchDoc[] = [];

  for (const article of articles) {
    docs.push({
      type: 'article',
      title: article.data.title,
      description: article.data.description,
      content: stripMarkdown(article.body ?? ''),
      url: articleHref(article),
      category: categoryDisplayName(article.data.category, locale),
      tags: article.data.tags,
    });
  }

  for (const category of categories) {
    docs.push({
      type: 'categoria',
      title: category.displayName,
      description: `${category.description} (${category.count} article${category.count === 1 ? '' : 's'})`,
      content: category.displayName,
      url: categoryHref(category.name, locale),
    });
  }

  for (const tag of tags) {
    docs.push({
      type: 'tag',
      title: tag.name,
      description: `${tag.count} article${tag.count === 1 ? '' : 's'} tagged with this`,
      content: tag.name,
      url: tagHref(tag.name, locale),
    });
  }

  const pages: SearchDoc[] = [
    {
      type: 'pagina',
      title: 'Home',
      description: 'A personal archive about artificial intelligence, technology, and everything worth learning slowly.',
      content: 'home',
      url: '/en',
    },
    { type: 'pagina', title: 'Articles', description: 'All published articles.', content: 'articles', url: '/en/articles' },
    { type: 'pagina', title: 'About', description: 'About the author and the blog.', content: 'about author', url: '/en/about' },
    { type: 'pagina', title: 'Links', description: "Links recommended by the author.", content: 'recommended links', url: '/en/links' },
    { type: 'pagina', title: 'Categories', description: 'All categories.', content: 'categories', url: '/en/categories' },
    { type: 'pagina', title: 'Tags', description: 'All tags.', content: 'tags', url: '/en/tags' },
  ];

  return new Response(JSON.stringify([...docs, ...pages]), {
    headers: { 'Content-Type': 'application/json' },
  });
};
