# Prompt para criação de um blog personalizado em Astro

Crie um blog completo, moderno e responsivo utilizando **Astro**, seguindo rigorosamente os requisitos funcionais e visuais abaixo.

## Objetivo

Desenvolver um blog rápido, acessível, otimizado para SEO e agradável para leitura prolongada. O visual deve ser minimalista, elegante e consistente em todas as páginas.

## Tecnologias e arquitetura

- Utilize a versão estável mais recente do Astro.
- Use TypeScript.
- Use componentes Astro reutilizáveis.
- Armazene os artigos em Astro Content Collections, usando Markdown ou MDX.
- Crie layouts compartilhados para páginas institucionais, listagens e artigos.
- Evite JavaScript no cliente quando não for necessário.
- Organize o projeto de forma clara e escalável.
- Inclua dados de exemplo para demonstrar todas as funcionalidades.
- Entregue código funcional, sem pseudocódigo ou funcionalidades apenas simuladas.

## Estrutura visual global

Todo o blog deve ficar dentro de uma `div` principal centralizada, ocupando aproximadamente **80% da largura da tela**.

Características do layout:

- Fundo externo cinza-claro.
- Conteúdo principal com fundo branco.
- Cantos arredondados.
- Sombra suave e discreta.
- Espaçamento interno confortável.
- Largura máxima que preserve a legibilidade em monitores grandes.
- Layout adaptado para desktop, tablet e celular.
- Em telas pequenas, o box deve ocupar quase toda a largura, mantendo margens laterais adequadas.
- Esse padrão deve ser aplicado a todas as páginas, incluindo artigos individuais, listagens, categorias, tags, links e página About.

## Tipografia

Utilize três fontes apropriadas para leitura, com carregamento otimizado e fallbacks seguros:

1. Uma fonte para títulos e destaques.
2. Uma fonte altamente legível para textos e artigos.
3. Uma fonte para elementos de interface, metadados, tags e navegação.

Escolha uma combinação harmoniosa, evitando excesso de variação visual. Mantenha tamanho de fonte, altura de linha e largura dos parágrafos adequados para não cansar a vista.

## Navbar

Crie uma navbar responsiva contendo:

- Logo ou nome do blog no lado esquerdo.
- No lado direito, os links:
  - Home
  - Artigos
  - About
  - Links
  - Categorias
  - Tags
- Destaque visual para a página ativa.
- Menu mobile acessível.
- Campo de busca global integrado à navbar.

### Busca global

A busca deve funcionar em tempo real e pesquisar:

- Título dos artigos.
- Descrição.
- Conteúdo.
- Categorias.
- Tags.
- Páginas institucionais e demais páginas relevantes.

Requisitos da busca:

- Atualização dos resultados enquanto o usuário digita.
- Busca sem diferenciação entre letras maiúsculas e minúsculas.
- Tratamento adequado de acentos.
- Navegação por teclado.
- Destaque do item selecionado.
- Mensagem quando nenhum resultado for encontrado.
- Cada resultado deve apresentar título, tipo de conteúdo e descrição resumida.
- A seleção deve direcionar para a página correspondente.
- Fechamento com a tecla `Escape` ou clique fora da área.
- Use uma solução leve e compatível com Astro, como Pagefind ou índice local equivalente.

## Página Home

A página inicial deve apresentar, nesta ordem:

### Introdução

Logo abaixo da navbar, crie uma seção alinhada à esquerda contendo uma descrição breve do blog, com aproximadamente **35 palavras**. Use um texto provisório claramente identificável para substituição posterior.

### Artigos recentes

Exiba os seis artigos mais recentes, ordenados pela data de publicação, em uma grade com:

- Duas fileiras.
- Três cards em cada fileira no desktop.
- Dois cards por fileira no tablet.
- Um card por fileira no celular.

Cada card deve conter:

- Título do artigo.
- Descrição resumida.
- Data de publicação.
- Categoria principal.
- Tags, quando apropriado.
- Link para o artigo completo.
- Estado de hover e foco acessível.
- Alturas visualmente equilibradas.

### Paginação

Quando houver mais de seis artigos:

- Exiba paginação abaixo dos cards.
- Mostre seis artigos por página.
- Inclua botões para página anterior e próxima.
- Indique visualmente a página atual.
- Use URLs navegáveis e amigáveis.
- Garanta acessibilidade por teclado e leitores de tela.

### Seção editorial

Abaixo dos cards, adicione:

- Um título centralizado, usando um texto provisório a ser definido.
- Aproximadamente três parágrafos.
- Cerca de 100 palavras no total.
- Largura de texto confortável para leitura.
- Conteúdo provisório coerente com a proposta do blog.

## Página Artigos

Crie uma página com todos os artigos publicados, ordenados do mais recente para o mais antigo.

Cada artigo deve ocupar uma linha ou bloco horizontal contendo:

- Título.
- Breve descrição.
- Data de publicação.
- Categoria.
- Link para leitura.

Adicione paginação quando necessário e mantenha um layout simples, escaneável e responsivo.

## Página de artigo individual

Cada artigo deve apresentar:

- Título.
- Descrição ou subtítulo.
- Autor.
- Data de publicação.
- Data de atualização, quando disponível.
- Tempo estimado de leitura.
- Categoria.
- Tags.
- Conteúdo formatado.
- Hierarquia correta de títulos.
- Links para o artigo anterior e o próximo.
- Breadcrumbs.
- Botão ou link para retornar à listagem de artigos.

Otimize a largura da coluna, altura de linha, espaçamento entre seções, blocos de código, citações, imagens, tabelas e listas para proporcionar excelente legibilidade.

## Página About

Inclua um texto sobre:

- O autor.
- Sua experiência ou interesses.
- A finalidade do blog.
- Os temas abordados.
- As formas de contato, caso sejam adicionadas posteriormente.

Use conteúdo provisório bem escrito e facilmente substituível.

## Página Links

Apresente os links recomendados pelo autor, um por linha ou bloco.

Cada item deve conter:

- Nome do site ou recurso.
- Link externo.
- Uma explicação breve na linha inferior.
- Indicação visual de que o link é externo.
- Atributos seguros para links abertos em nova aba.

Permita organizar os links por grupos ou temas.

## Página Categorias

Crie uma página otimizada para SEO com todas as categorias utilizadas nos artigos.

Cada categoria deve mostrar:

- Nome.
- Descrição.
- Quantidade de artigos.
- Link para sua página individual.

Crie também páginas individuais de categoria, listando os respectivos artigos em ordem cronológica inversa.

Use URLs amigáveis, como:

```text
/categorias
/categorias/nome-da-categoria
```

## Página Tags

Crie uma página otimizada para SEO com todas as tags utilizadas.

Cada tag deve apresentar:

- Nome.
- Quantidade de artigos.
- Link para sua página individual.

Crie páginas individuais para cada tag, exibindo os artigos relacionados.

Use URLs amigáveis, como:

```text
/tags
/tags/nome-da-tag
```

## Footer

Crie um footer em alinhamento horizontal contendo:

- Links externos definidos pelo autor.
- Links para redes sociais, se configurados.
- Copyright com ano atualizado automaticamente.
- Nome do blog ou autor.

No celular, permita a reorganização dos elementos sem prejudicar a leitura.

## Design system

Defina um sistema visual consistente com:

- Paleta neutra e agradável.
- Uma única cor principal de destaque.
- Contraste adequado.
- Espaçamentos padronizados.
- Bordas discretas.
- Sombras suaves.
- Estados de hover, foco e seleção.
- Botões e links visualmente consistentes.
- Suporte opcional ao modo escuro, desde que não prejudique o design principal.

Não use animações excessivas. Respeite `prefers-reduced-motion`.

## Conteúdo e dados

Crie pelo menos oito artigos de exemplo para que seja possível testar:

- Ordenação por data.
- Grade da página inicial.
- Paginação.
- Categorias.
- Tags.
- Busca global.
- Artigos anteriores e seguintes.

Cada artigo deve possuir, no mínimo:

```yaml
title:
description:
publishDate:
updatedDate:
author:
category:
tags:
draft:
```

Centralize as informações editáveis do blog em um arquivo de configuração, incluindo:

- Nome do blog.
- Logo.
- Descrição.
- Autor.
- Links externos.
- Redes sociais.
- Quantidade de artigos por página.
- Informações de copyright.

## SEO e compartilhamento

Implemente:

- Títulos e descrições únicos por página.
- URLs canônicas.
- Open Graph.
- Twitter Cards.
- Sitemap.
- RSS.
- `robots.txt`.
- Dados estruturados apropriados em JSON-LD.
- Metadados de artigo.
- Slugs amigáveis.
- Página 404 personalizada.
- HTML semântico.
- Apenas um `h1` principal por página.

## Acessibilidade e desempenho

Garanta:

- Navegação completa por teclado.
- Foco visível.
- Labels e atributos ARIA quando necessários.
- Link “pular para o conteúdo”.
- Contraste compatível com WCAG.
- Imagens com texto alternativo.
- Layout sem mudanças bruscas durante o carregamento.
- Imagens otimizadas pelos recursos do Astro.
- Excelente desempenho no Lighthouse.
- JavaScript mínimo no cliente.

## Entrega

Forneça:

1. Estrutura completa de pastas.
2. Todos os arquivos e componentes necessários.
3. Conteúdo de demonstração.
4. Instruções para instalação e execução.
5. Instruções para criar novos artigos.
6. Explicação de onde editar textos, identidade visual, links e configurações.
7. Comandos para desenvolvimento, build e preview.
8. Projeto sem erros de TypeScript, build ou links internos.

Antes de concluir, execute a validação de tipos e o build de produção. Corrija todos os erros encontrados e verifique visualmente as páginas nos tamanhos desktop, tablet e celular.
