---
title: "Organizing content with Astro Content Collections"
description: "How to structure Markdown articles in a typed, validated, and easy-to-scale way using Content Collections."
publishDate: 2026-07-20
author: "Alicino"
category: "Engenharia"
tags: ["astro", "typescript", "content-collections"]
draft: false
---

When a project grows beyond a handful of loose pages, it's worth having a
structured way to store content. That's exactly what Astro's **Content
Collections** solve.

## The problem they solve

Before collections, it was common to import Markdown files manually and hope
the front matter was correct. A missing field was only noticed in
production — usually in the worst possible way.

## How it works in practice

Each collection has a schema, validated with Zod:

```ts
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});
```

If a new article has `publishDate: "yesterday"` instead of a valid date, the
build fails immediately — not in production.

> Validating content at build time is one of the cheapest ways to avoid silly
> bugs on a blog or documentation site.

### The advantages I noticed the most

1. Front matter autocomplete in the editor.
2. Clear build errors when a required field is missing.
3. Typed queries (`getCollection`, `getEntry`) with no hidden `any`.

### When it's not worth it

For a site with three static pages, this is over-engineering. Collections
shine when the content grows and several people (or you, six months later)
need to trust the shape of the data.

| Scenario | Worth it? |
| --- | --- |
| Blog with dozens of posts | Yes |
| Technical documentation | Yes |
| Single landing page | Probably not |

At the end of the day, the real gain isn't technical, it's trust: you stop
manually checking whether you forgot a field in some file.
