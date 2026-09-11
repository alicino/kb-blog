---
title: "Soup CLI: treine modelos de IA que não cabem na sua GPU usando layer streaming"
description: "Conheça o Soup, uma ferramenta open source que permite fine-tuning de LLMs de até 8B parâmetros em GPUs de apenas 4 GB. Instalação, configuração, treinamento e serving."
publishDate: 2026-09-11
author: "Alicino"
category: "Inteligência Artificial"
tags: ["Soup", "layer streaming", "fine-tuning", "LLM", "LoRA", "treinamento", "GPU", "machine learning", "open source"]
draft: false
---

Você tem uma placa de vídeo com 4, 6 ou 8 GB de VRAM. Um notebook gamer, um desktop com uma RTX 2060 Super, ou um Mac Mini M4 com 32 GB de memória unificada. Você quer treinar ou ajustar um modelo de linguagem grande, mas descobre que o modelo não cabe na sua GPU.

A resposta usual para esse problema tem três opções: quantizar mais (e perder qualidade), alugar uma GPU na nuvem (e pagar por hora), ou desistir.

O Soup CLI oferece uma quarta opção: nunca carregar o modelo inteiro na VRAM.

## O que é layer streaming

Layer streaming resolve o problema fundamental do fine-tuning em hardware modesto.

```mermaid
flowchart LR
    subgraph RESIDENT["Treinamento tradicional"]
        VRAM1[VRAM<br>Modelo base<br>+ LoRA<br>+ Gradientes<br>+ Otimizador]
    end

    subgraph STREAMING["Layer streaming (Soup)"]
        RAM[RAM<br>Modelo base<br>inteiro<br>(quantizado NF4)]
        VRAM2[VRAM<br>1 camada por vez<br>+ LoRA<br>+ Gradientes<br>+ Otimizador]
        RAM -->|Copia camada 1| VRAM2
        RAM -->|Copia camada 2| VRAM2
        RAM -->|Copia camada N| VRAM2
    end
```