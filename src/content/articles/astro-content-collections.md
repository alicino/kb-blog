---
title: "Organizando conteúdo com Astro Content Collections"
description: "Como estruturar artigos em Markdown de forma tipada, validada e fácil de escalar usando Content Collections."
publishDate: 2026-07-20
author: "Alicino"
category: "Engenharia"
tags: ["astro", "typescript", "content-collections"]
draft: false
---

Quando um projeto cresce além de algumas páginas soltas, vale a pena ter uma forma
estruturada de guardar conteúdo. É exatamente isso que as **Content Collections**
do Astro resolvem.

## O problema que elas resolvem

Antes das collections, era comum importar arquivos Markdown manualmente e torcer
para que o front matter estivesse correto. Um campo faltando só era percebido em
produção — geralmente da pior forma possível.

## Como funciona na prática

Cada coleção tem um schema, validado com Zod:

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

Se um artigo novo tiver `publishDate: "ontem"` em vez de uma data válida, o build
falha imediatamente — não em produção.

> Validar conteúdo no momento do build é uma das formas mais baratas de evitar
> bugs bobos em um blog ou site de documentação.

### Vantagens que mais notei

1. Autocomplete de front matter no editor.
2. Erros de build claros quando um campo obrigatório falta.
3. Consultas tipadas (`getCollection`, `getEntry`) sem `any` escondido.

### Quando não vale a pena

Para um site com três páginas estáticas, isso é over-engineering. Collections
brilham quando o conteúdo cresce e várias pessoas (ou você, seis meses depois)
precisam confiar no formato dos dados.

| Cenário | Vale a pena? |
| --- | --- |
| Blog com dezenas de posts | Sim |
| Documentação técnica | Sim |
| Landing page única | Provavelmente não |

No fim das contas, o ganho real não é técnico, é de confiança: você para de
verificar manualmente se esqueceu um campo em algum arquivo.
