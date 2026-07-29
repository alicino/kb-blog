import type { APIRoute } from 'astro';
import { getPublishedArticles, getCategories, getTags, articleHref, categoryHref, tagHref } from '../lib/articles';
import { stripMarkdown, type SearchDoc } from '../lib/search';
import { siteConfig } from '../site.config';

export const prerender = true;

export const GET: APIRoute = async () => {
  const articles = await getPublishedArticles();
  const categories = await getCategories();
  const tags = await getTags();

  const docs: SearchDoc[] = [];

  for (const article of articles) {
    docs.push({
      type: 'article',
      title: article.data.title,
      description: article.data.description,
      content: stripMarkdown(article.body ?? ''),
      url: articleHref(article),
      category: article.data.category,
      tags: article.data.tags,
    });
  }

  for (const category of categories) {
    docs.push({
      type: 'categoria',
      title: category.name,
      description: `${category.description} (${category.count} artigo${category.count === 1 ? '' : 's'})`,
      content: category.name,
      url: categoryHref(category.name),
    });
  }

  for (const tag of tags) {
    docs.push({
      type: 'tag',
      title: tag.name,
      description: `${tag.count} artigo${tag.count === 1 ? '' : 's'} com esta tag`,
      content: tag.name,
      url: tagHref(tag.name),
    });
  }

  const pages: SearchDoc[] = [
    { type: 'pagina', title: 'Home', description: siteConfig.tagline, content: 'home inicio', url: '/' },
    { type: 'pagina', title: 'Artigos', description: 'Todos os artigos publicados.', content: 'artigos', url: '/artigos' },
    { type: 'pagina', title: 'About', description: 'Sobre o autor e o blog.', content: 'sobre autor', url: '/about' },
    { type: 'pagina', title: 'Links', description: 'Links recomendados pelo autor.', content: 'links recomendados', url: '/links' },
    { type: 'pagina', title: 'Categorias', description: 'Todas as categorias.', content: 'categorias', url: '/categorias' },
    { type: 'pagina', title: 'Tags', description: 'Todas as tags.', content: 'tags', url: '/tags' },
  ];

  return new Response(JSON.stringify([...docs, ...pages]), {
    headers: { 'Content-Type': 'application/json' },
  });
};
