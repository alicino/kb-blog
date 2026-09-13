import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Alicino'),
      category: z.enum([
        'Carreira',
        'Design',
        'DevOps',
        'Engenharia',
        'Ferramentas',
        'Infraestrutura e Redes',
        'Inteligência Artificial',
        'Produtividade',
        'Redes',
        'Segurança',
      ]),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

export const collections = { articles };
