---
title: "Escrevendo CSS que ainda faz sentido daqui a um ano"
description: "Algumas convenções simples de nomenclatura, variáveis e organização que evitam CSS que ninguém quer tocar."
publishDate: 2026-07-15
author: "Alicino"
category: "Design"
tags: ["css", "design-system", "manutenibilidade"]
draft: false
coverAlt: "Ilustração de camadas de estilo se sobrepondo"
---

CSS raramente fica ruim de uma vez. Ele piora aos poucos, um `!important` de
cada vez, até ninguém mais saber com segurança o que pode ser removido.

## Comece pelas variáveis, não pelos componentes

Antes de estilizar qualquer coisa, defina um pequeno conjunto de variáveis:

```css
:root {
  --color-accent: hsl(156 45% 32%);
  --space-4: 1rem;
  --radius-md: 12px;
}
```

Isso cria um vocabulário compartilhado. Em vez de "essa borda tem 11px ou 12px
de raio?", a pergunta vira "isso usa `--radius-md` ou `--radius-lg`?" — muito
mais fácil de revisar.

## Nomeie pelo que o elemento é, não pelo que parece

`.card-azul` quebra no dia em que o design pede um cartão verde. Prefira nomes
que descrevam a função: `.card-destaque`, `.card-secundario`.

![Placeholder ilustrando camadas de design](/placeholder.svg)

### Uma checklist rápida

- A variável já existe antes de eu inventar um novo valor mágico?
- Esse seletor depende de três níveis de aninhamento para funcionar?
- Se eu deletar essa classe, algo quebra em uma página que eu não testei?

Se a resposta para a última pergunta for "não tenho certeza", isso já é um
sinal de que o CSS está mais frágil do que deveria.

## Sustentabilidade é sobre remoção, não só adição

Um sistema de design saudável permite deletar CSS morto com confiança. Isso só
é possível quando os estilos são previsíveis o suficiente para saber, só de
olhar, o que vai quebrar.
