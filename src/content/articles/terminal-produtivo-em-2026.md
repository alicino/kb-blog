---
title: "Montando um terminal produtivo em 2026"
description: "Sem virar hobby: um setup de terminal enxuto que resolve 90% do trabalho do dia a dia."
publishDate: 2026-05-15
author: "Alicino"
category: "Ferramentas"
tags: ["terminal", "ferramentas-cli", "produtividade"]
draft: false
---

Configurar terminal é um dos hobbies disfarçados de produtividade mais comuns
entre quem programa. Este é o ponto em que parei de mexer.

## O essencial, sem exagero

- Um shell com histórico compartilhado entre sessões.
- Atalhos para os três ou quatro comandos usados o dia inteiro.
- Um prompt que mostra branch, status do git e código de saída do último
  comando — nada além disso.

## O que eu decidi não usar

Plugins de terminal com animações, previews de arquivos ou integrações
elaboradas com serviços externos. Cada segundo de latência num terminal se
acumula ao longo do dia.

```bash
alias gs="git status --short --branch"
alias gd="git diff"
```

Duas linhas de configuração que uso mais do que qualquer plugin sofisticado
que já experimentei.

## Regra prática para adicionar algo novo

Antes de adicionar uma ferramenta ao terminal, pergunto: isso vai economizar
tempo hoje, ou só parece interessante para configurar uma vez e nunca mais
notar?
