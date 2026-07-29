---
title: "Tipografia para textos que pedem leitura longa"
description: "Escolhas de fonte, altura de linha e largura de coluna que fazem diferença depois do décimo parágrafo."
publishDate: 2026-06-10
author: "Alicino"
category: "Design"
tags: ["tipografia", "design-system", "acessibilidade"]
draft: false
---

Tipografia boa não se percebe quando está certa. Percebe-se quando está
errada, geralmente como um cansaço vago que aparece depois de alguns
parágrafos.

## Largura de coluna importa mais do que parece

Uma boa referência é manter entre 60 e 75 caracteres por linha. Colunas muito
largas fazem o olho perder a linha ao voltar; colunas muito estreitas
fragmentam o ritmo de leitura.

## Altura de linha generosa em textos longos

Para corpo de texto, algo entre 1.5 e 1.7 costuma equilibrar bem densidade e
conforto. Títulos podem — e devem — ser mais compactos.

```css
article {
  max-width: 68ch;
  line-height: 1.65;
}
```

## Hierarquia sem excesso de variação

Três famílias tipográficas bem escolhidas — uma para título, uma para corpo,
uma para interface — já cobrem praticamente qualquer necessidade. Mais do que
isso tende a parecer ruído em vez de hierarquia.

### Contraste também é tipografia

Cor de texto sobre fundo, tamanho mínimo de fonte e espaçamento entre letras
em maiúsculas fazem parte da mesma conversa. Tipografia acessível não é uma
etapa separada do design — é o design.
