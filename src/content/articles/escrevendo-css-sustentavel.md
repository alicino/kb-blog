---
title: "Escrevendo CSS que ainda faz sentido daqui a um ano"
description: "Como escrever CSS que envelhece bem: camadas de cascata, variáveis registradas, nomes que descrevem função e um método para apagar código morto sem medo."
publishDate: 2026-07-15
author: "Alicino"
category: "Design"
tags: ["css", "design-system", "manutenibilidade", "cascata"]
draft: false
coverAlt: "Ilustração de camadas de estilo se sobrepondo"
---

<img src="/assets/img/escrevendo-css-sustentavel-1.png" alt="Capa sobre escrever CSS sustentável: design tokens, camadas e regras que envelhecem bem" width="1200" height="333" />

CSS não fica ruim de uma vez. Ele piora um `!important` por vez, até que ninguém saiba mais o que pode ser apagado sem quebrar alguma página que você não testou.

O sintoma que denuncia esse estado é sempre o mesmo: você precisa **mexer** no layout, e não consegue prever o resultado. Muda o raio da borda, a cor muda em outra página, o espaçamento colapsa num componente distante. Você então protege a mudança com mais especificidade, e o problema cresce.

Este artigo é sobre o contrário disso. O objetivo é que, daqui a um ano, você consiga abrir o arquivo, entender o que cada regra faz e apagar o que sobrou, com confiança.

## O que você vai aprender

- O que a cascata decide antes da especificidade, e por que `@layer` resolve o problema que `!important` só empurra para frente
- Como declarar variáveis que se defendem sozinhas, em vez de virarem valores mágicos disfarçados
- Por que nomear pelo que o elemento é envelhece melhor que nomear pelo que ele parece
- Um método prático para descobrir se uma classe ainda é usada antes de apagá-la

## A cascata decide mais do que a especificidade

A maioria dos problemas de CSS nasce de uma confusão comum: acreditar que "seletor mais específico vence" é a regra principal. Não é.

A cascata é um algoritmo com etapas em ordem. A especificidade é apenas **uma** delas, avaliada depois de origem e camada. Na prática, isso significa que um seletor mais específico pode perder para um seletor mais simples, se estiverem em camadas diferentes.

A ordem de precedência, de maior para menor, para estilos de autor:

1. Camadas declaradas por último (e regras fora de qualquer camada, que vêm antes de todas)
2. Especificidade do seletor
3. Ordem em que a regra aparece no arquivo

O ponto sutil está no item 1, e é ele que muda o jogo.

### O `!important` inverte a ordem das camadas

Aqui está a armadilha que pega quase todo mundo na primeira vez. Dentro de uma camada, `!important` se comporta **ao contrário** da ordem normal: a **primeira** camada declarada passa a vencer, não a última.

Testei isso num navegador para não repetir o que a documentação diz de memória:

```css
@layer base, utils;

@layer base {
  .a { color: red; }
  .b { color: red !important; }
}

@layer utils {
  .a { color: blue; }
  .b { color: blue !important; }
}
```

O elemento com `.a` fica **azul** (`utils` foi declarado por último, vence). O elemento com `.b` fica **vermelho**: `base` venceu, mesmo sendo a primeira camada, porque o `!important` inverte a prioridade.

O resultado medido no Chromium:

```
.a  -> rgb(0, 0, 255)   /* azul: última camada vence */
.b  -> rgb(255, 0, 0)   /* vermelho: !important inverteu */
```

O motivo pelo qual isso é útil, e não só confuso: `!important` dentro de camadas deixa de ser um botão de emergência e passa a ser uma ferramenta de exceção que respeita uma ordem que você controla. Fora de camadas, ele continua sendo o que sempre foi, um sinal de que a cascata está desorganizada.

### Declare a ordem das camadas num lugar só

O `@layer` permite separar o **nascimento** da ordem do **conteúdo**. Você declara os nomes uma vez, no topo, e depois escreve cada pedaço onde fizer sentido:

```css
/* a ordem se decide aqui, e só aqui */
@layer reset, tokens, layout, components, utilities;
```

```css
@layer components {
  .card {
    background: var(--surface);
    border-radius: var(--radius-md);
  }
}
```

```css
@layer utilities {
  .stack > * + * { margin-block-start: var(--space-4); }
}
```

Com isso, a pergunta "quem vence entre o estilo do componente e o utilitário?" tem resposta escrita, num arquivo, sem contar pontos de especificidade. Você não precisa mais calcular `(0,2,0)` contra `(0,1,1)`. A camada decidiu antes.

O suporte é maduro: `@layer` funciona em todos os navegadores desde **março de 2022**.

## Variáveis que se defendem sozinhas

Definir um conjunto pequeno de tokens antes de estilizar qualquer coisa continua sendo o primeiro passo, e é o mais barato:

```css
:root {
  --color-accent: hsl(156 45% 32%);
  --space-4: 1rem;
  --radius-md: 12px;
}
```

O ganho não é estético. É que a pergunta deixa de ser "essa borda tem 11px ou 12px de raio?" e passa a ser "isso usa `--radius-md` ou `--radius-lg`?", que tem resposta binária e verificável.

Existe um segundo nível, porém, que a maioria pula: variáveis comuns são **strings de texto** até o momento de serem usadas. O navegador não valida nada até a hora de aplicar, e essa demora esconde erros.

### `@property` dá tipo à variável

O at-rule `@property` registra a variável com um tipo, e muda o comportamento de forma mensurável:

```css
@property --gap {
  syntax: "<length>";
  inherits: false;
  initial-value: 8px;
}
```

Com isso, três coisas passam a valer:

- **Valor inválido cai para o padrão.** Um `--gap: not-a-length` não quebra o layout: o navegador usa `8px`.
- **A variável tem tipo.** Um loop de animação sobre `--gap` não precisa ser reprocessado a cada quadro, porque o tipo já é conhecido.
- **`inherits: false` limita o recálculo.** Quando o valor muda, os filhos não precisam ser reprocessados.

Medi as duas primeiras no navegador:

```
--gap registrado, sem override   -> padding: 8px
--gap: not-a-length (inválido)   -> padding: 8px   /* caiu para o initial-value */
```

Sem o `@property`, a segunda linha seria imprevisível. Com ele, falhar tem um comportamento definido. E comportamento definido é exatamente o que permite apagar código depois.

Vale saber a diferença de humor do `var()`: o segundo argumento é o fallback usado quando a variável não tem valor **utilizável**. Se a variável estiver registrada com `initial-value`, esse valor inicial entra em cena e o fallback nem é consultado. São duas camadas de proteção diferentes, não a mesma.

```css
.sem-registro { color: var(--nao-existe, rebeccapurple); }  /* usa o fallback */
```

## Nomeie pelo que o elemento é, não pelo que parece

`.card-azul` quebra no dia em que o design pede um cartão verde, e aí alguém cria `.card-azul-verde`, e o nome mente para sempre.

Prefira nomes que descrevam a **função**:

- `.card-destaque` em vez de `.card-azul`
- `.card-secundario` em vez de `.card-cinza`
- `.texto-atencao` em vez de `.texto-vermelho`

A regra prática que resolve 90% dos casos: se a cor ou o tamanho aparecem no nome da classe, provavelmente o nome está descrevendo a aparência. Esses valores pertencem a uma variável, não ao nome.

### Um cuidado com aninhamento

O CSS nativo agora aninha, e isso é bom: a cobertura global passou de **94%** e o recurso funciona nos navegadores atuais sem build step. O risco é o mesmo que os pré-processadores já ensinavam: aninhar porque dá, e não porque o seletor precisa.

Aninhar quando o seletor depende do pai é legítimo:

```css
.card {
  .card__title { font-weight: 600; }
}
```

Aninhar por conveniência é o que produz o problema:

```css
.page {
  .section {
    .card {
      .card__title { font-weight: 600; }
    }
  }
}
```

O segundo caso gera um seletor que só funciona dentro de três níveis de contexto. Mover o componente de lugar passa a exigir mexer no CSS dele.

## Antes de apagar: descubra se a classe ainda é usada

"Sustentabilidade é sobre remoção" soa bonito e é inútil se você não tiver como remover com segurança. O que torna a remoção possível é ter uma ferramenta de verificação, não coragem.

Neste blog, que é Astro com classes escritas à mão, o que funciona é procurar a classe nos arquivos de conteúdo e de componente antes de mexer:

```bash
# a classe aparece em algum artigo, componente ou página?
rg -n "card-destaque" src/
```

Se voltar vazio, a classe é candidata. Se voltar em um arquivo só, você sabe exatamente o que testar depois da mudança.

Quando o CSS é gerado por build, a verificação certa é a inversa: pergunte ao navegador quais regras foram de fato usadas. No DevTools, a aba **Coverage** faz exatamente isso: mostra quanto do CSS carregado foi realmente aplicado.

O método importa menos que a existência dele. CSS que ninguém consegue auditar é CSS que ninguém apaga. É assim que um arquivo de 300 linhas vira 3.000.

### Uma checklist rápida

- A variável já existe antes de eu inventar um novo valor mágico?
- Esse seletor depende de três níveis de aninhamento para funcionar?
- O nome dessa classe descreve a aparência ou a função?
- Se eu deletar essa classe, algo quebra em uma página que eu não testei?

Se a resposta para a última pergunta for "não tenho certeza", o problema não é a sua memória: é o CSS que não dá para auditar.

## Conclusão

CSS sustentável não é o que está bem organizado hoje. É o que **permite ser reorganizado amanhã** sem susto.

Três mudanças carregam quase todo o peso:

- **Declare a ordem das camadas uma vez**, no topo. A pergunta "quem vence" deixa de exigir cálculo mental.
- **Registre as variáveis que importam.** Falhar passa a ter comportamento definido.
- **Tenha um jeito de verificar uso** antes de apagar. Sem isso, remoção vira aposta.

O resto (nomes, aninhamento, ordem dos arquivos) sai mais fácil quando essas três bases estão no lugar.

## Fontes e links

- [MDN: `@layer` — CSS at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer) — precedência entre camadas, incluindo a inversão do `!important`, e o suporte desde março de 2022
- [MDN: Introdução à cascata do CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade) — a ordem das etapas do algoritmo, com origem e camada antes da especificidade
- [MDN: `var()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/var) — quando o fallback é consultado e o que é o "valor garantidamente inválido"
- [MDN: Registrando propriedades customizadas](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Properties_and_values_API/Registering_properties) — `syntax`, `inherits` e `initial-value` no `@property`
- [Can I use: CSS Nesting](https://caniuse.com/css-nesting) — cobertura global do aninhamento nativo e a tabela por navegador
- [W3C: CSS Properties and Values API Level 1](https://www.w3.org/TR/css-properties-values-api/) — a especificação por trás do `@property`
