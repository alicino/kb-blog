# knowledge base — blog em Astro

Blog pessoal construído com [Astro](https://astro.build) 7 + TypeScript estrito,
Content Collections, busca global client-side e SEO completo.

## Requisitos

- Node.js ≥ 22.12
- npm ≥ 9.6 (ou pnpm ≥ 7)

## Comandos

```bash
npm install       # instala as dependências
npm run dev       # ambiente de desenvolvimento em http://localhost:4321
npm run check     # valida tipos (astro check)
npm run build     # roda astro check + gera o build de produção em dist/
npm run preview   # serve o build de produção localmente, para conferência final
```

`npm run build` falha o processo se houver qualquer erro de tipos — rode
`npm run check` isoladamente durante o desenvolvimento para feedback mais rápido.

## Estrutura do projeto

```
src/
  components/       Navbar, Footer, SearchBox, cards de artigo, paginação, SEO, etc.
  content/
    articles/        Artigos em Markdown (uma coleção: "articles")
  content.config.ts  Schema da coleção de artigos (Content Layer API)
  data/
    links.json         Links recomendados exibidos em /links (editável sem tocar em código)
  layouts/
    BaseLayout.astro Layout raiz: <head>, navbar, footer, skip link, tema
  lib/
    articles.ts       Consultas e helpers sobre a coleção (ordenação, slugs, categorias, tags)
    paginate.ts        Paginação genérica usada por Home e /artigos
    search.ts           Normalização de texto e tipos usados pela busca
  pages/
    index.astro, [page].astro         Home paginada
    artigos/index.astro, [slug].astro, pagina/[page].astro
    categorias/index.astro, [category].astro
    tags/index.astro, [tag].astro
    about.astro, links.astro, 404.astro
    rss.xml.ts, robots.txt.ts, search-index.json.ts
  site.config.ts     Configuração central do blog (edite aqui primeiro)
  styles/global.css  Design tokens, layout global e estilos de leitura (.prose)
public/              Arquivos estáticos (favicon, placeholder de imagem)
```

## Onde editar o quê

| O que você quer mudar | Onde editar |
| --- | --- |
| Nome do blog, headline, tagline, autor, redes sociais, links do rodapé, quantidade de artigos por página | `src/site.config.ts` |
| Texto da página About | `src/pages/about.astro` |
| Links recomendados (adicionar, editar, remover, reorganizar em grupos) | `src/data/links.json` |
| Cores, tipografia, espaçamentos, modo escuro | `src/styles/global.css` (variáveis no topo do arquivo) |
| Navbar (itens de menu) | `src/components/Navbar.astro` |
| Descrição de uma categoria | `src/lib/articles.ts` → `CATEGORY_DESCRIPTIONS` |
| URL de produção (usada em SEO, sitemap, RSS, robots.txt) | `site.url` em `src/site.config.ts` **e** `site` em `astro.config.mjs` |

## Como criar um novo artigo

1. Crie um arquivo `.md` (ou `.mdx`) em `src/content/articles/`, por exemplo
   `src/content/articles/meu-novo-artigo.md`. O nome do arquivo vira a URL:
   `/artigos/meu-novo-artigo`.
2. Adicione o front matter obrigatório:

   ```yaml
   ---
   title: "Título do artigo"
   description: "Resumo de uma ou duas frases, usado em cards, SEO e RSS."
   publishDate: 2026-08-01
   author: "Alicino"
   category: "Engenharia"
   tags: ["astro", "css"]
   draft: false
   ---
   ```

   Campos opcionais: `updatedDate`, `coverAlt`. Se `draft: true`, o artigo só
   aparece em `npm run dev` — ele é automaticamente excluído do build de
   produção, da home, das listagens, do RSS e da busca.
3. Escreva o conteúdo em Markdown a partir de um `##` (o `#`/H1 já é gerado
   automaticamente a partir do `title`).
4. Categorias e tags são criadas automaticamente a partir do que for usado no
   front matter — não é preciso cadastrar em nenhum outro lugar.

## Onde colocar imagens

Duas opções, dependendo do uso:

- **`public/`** — para arquivos estáticos, sem processamento (é onde já estão
  o favicon e o placeholder). Referencia-se por caminho absoluto, por exemplo
  `/minha-imagem.png`, e funciona em qualquer lugar (componentes, Markdown,
  etc.). É o caso mais simples — use para imagens soltas no corpo de um
  artigo (`![alt](/minha-imagem.png)`) ou para assets gerais do site.
- **Ao lado do artigo, dentro de `src/content/articles/`** — para a imagem de
  capa de um artigo, usando o campo `cover` do front matter (já validado pelo
  schema em `content.config.ts`). Colocando o arquivo na mesma pasta do
  `.md` e referenciando por caminho relativo, a imagem passa pelo pipeline de
  otimização de imagens do Astro:

  ```yaml
  cover: ./capa.jpg
  coverAlt: "Descrição da imagem"
  ```

## Como editar os links recomendados (/links)

Os links exibidos em `/links` vêm de `src/data/links.json` — um arquivo JSON puro,
sem TypeScript, pensado para ser editado, ter itens inseridos e removidos com
facilidade. Formato: uma lista de grupos, cada um com um `group` (nome do tema)
e uma lista de `links`:

```json
[
  {
    "group": "Ferramentas",
    "links": [
      {
        "label": "Nome do site",
        "url": "https://exemplo.com",
        "description": "Uma frase curta explicando por que vale a pena."
      }
    ]
  }
]
```

Para adicionar um link, inclua um novo objeto dentro do `links` do grupo
desejado. Para remover, apague o objeto. Para criar um grupo novo, adicione
outro `{ "group": "...", "links": [...] }` à lista. Não é preciso reiniciar
nada além do `npm run dev` já em execução (ele recarrega sozinho ao salvar).

## Busca global

A busca (campo na navbar) usa um índice JSON gerado em build time
(`/search-index.json`, veja `src/pages/search-index.json.ts`) com título,
descrição, conteúdo, categoria e tags de cada artigo, além das páginas
institucionais. No navegador, `src/components/SearchBox.astro` faz busca
client-side, sem diferenciar maiúsculas/minúsculas ou acentos, com navegação
por teclado (setas, Enter, Escape) e mensagem de "nenhum resultado".

## Antes de publicar

- Ajuste `site.url` em `src/site.config.ts` e `site` em `astro.config.mjs`
  para o domínio real (isso afeta URLs canônicas, sitemap, RSS e Open Graph).
- Rode `npm run build` e confira que termina sem erros de tipos ou de build.
- Rode `npm run preview` e navegue pelo site gerado antes do deploy.
