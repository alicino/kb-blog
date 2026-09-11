---
title: "Fine-tuning de IA para iniciantes: o que significa cada termo que você encontra por aí"
description: "Um guia simples e direto sobre os termos usados em fine-tuning de modelos de IA: LLM, LoRA, quantização, GPU, VRAM, dataset, SFT, DPO e muito mais."
publishDate: 2026-09-11
author: "Alicino"
category: "Inteligência Artificial"
tags: ["fine-tuning", "iniciantes", "LLM", "LoRA", "quantização", "GPU", "glossário", "IA", "aprendizado"]
draft: false
---

Se você está começando a explorar o mundo dos modelos de inteligência artificial, já deve ter se deparado com frases como:

> "Com um arquivo YAML você define o modelo base, a tarefa SFT ou DPO, os hiperparâmetros, aplica quantização e começa o treinamento."

Se você leu isso e pensou "não entendi nada", este artigo é para você.

Vamos explicar cada termo desses de forma simples, como se estivéssemos conversando. No final, você vai entender o que cada peça significa e por que elas importam.

## O que é um modelo de IA (ou LLM)

Um modelo de IA é um programa de computador que foi treinado com uma quantidade imensa de textos para aprender padrões da linguagem humana. Ele não "pensa" como uma pessoa, mas aprendeu a probabilidade de uma palavra vir depois da outra.

LLM significa Large Language Model, ou Modelo de Linguagem Grande. São modelos com bilhões de parâmetros. Um parâmetro é como um "botão de ajuste" interno do modelo. Quanto mais parâmetros, mais complexo o modelo tende a ser.

Para você ter uma ideia:

- Um modelo pequeno: 500 milhões de parâmetros (0,5B)
- Um modelo médio: 3 bilhões de parâmetros (3B)
- Um modelo grande: 8 bilhões de parâmetros (8B)
- Um modelo muito grande: 70 bilhões de parâmetros (70B)

Cada parâmetro ocupa espaço na memória do computador. É por isso que modelos grandes precisam de placas de vídeo poderosas.

Exemplos de LLMs famosos: Llama (Meta), Qwen (Alibaba), Mistral, Gemma (Google), GPT (OpenAI).

## O que é fine-tuning

Fine-tuning é o processo de pegar um modelo que já foi treinado e "ajustá-lo" para uma tarefa específica.

Imagine que você contratou um chef de cozinha que sabe cozinhar de tudo (esse é o modelo base). O fine-tuning seria como dar a ele um curso intensivo de culinária italiana. Ele continua sabendo cozinhar de tudo, mas agora entende muito melhor de massas e molhos.

Na prática, fine-tuning é quando você pega um modelo genérico e o treina com seus próprios dados para que ele se especialize no seu assunto.

## O que é LoRA

LoRA (Low-Rank Adaptation) é uma técnica que torna o fine-tuning muito mais leve.

Voltando ao exemplo do chef: em vez de ensinar tudo de novo para ele (o que seria caro e demorado), você dá a ele um pequeno caderno de receitas italiano. O chef continua sendo o mesmo, mas agora tem um complemento que o ajuda na cozinha italiana.

Tecnicamente, o LoRA cria pequenos adaptadores que são treinados enquanto o modelo base original fica congelado. Isso reduz drasticamente a quantidade de memória necessária e o tempo de treinamento.

Sem LoRA, treinar um modelo de 8 bilhões de parâmetros exigiria uma placa de vídeo com mais de 60 GB de VRAM. Com LoRA, você pode fazer o mesmo fine-tuning em uma placa de 8 GB.

No final do treinamento, o LoRA gera um arquivo pequeno (o adaptador) que você pode compartilhar ou aplicar ao modelo base quando for usar.

## O que é VRAM e por que ela importa

VRAM é a memória da placa de vídeo (GPU). É diferente da RAM do seu computador.

Quando você treina ou usa um modelo de IA, ele precisa ser carregado na VRAM da GPU. É lá que os cálculos acontecem. Quanto mais VRAM sua placa tem, maiores os modelos que você consegue rodar.

- 4 GB de VRAM: modelos muito pequenos ou modelos grandes com técnicas especiais
- 8 GB de VRAM: modelos de até 3B parâmetros sem truques, ou 8B com LoRA
- 12 GB de VRAM: modelos de 7B confortavelmente
- 24 GB de VRAM (RTX 3090/4090): modelos de 13B a 30B com quantização

Se o modelo não couber na sua VRAM, você não consegue treinar. É por isso que técnicas como LoRA e layer streaming existem.

## O que é quantização

Quantização é uma técnica para reduzir o tamanho de um modelo sem perder muita qualidade.

Pense em uma foto. Uma foto RAW de alta qualidade ocupa muito espaço. Uma foto JPEG compactada ocupa menos, mas ainda é bonita de ver. A quantização é como transformar o modelo de RAW para JPEG.

Os números que formam os parâmetros do modelo podem ser armazenados com diferentes níveis de precisão:

- **bf16** (16 bits): precisão alta, ocupa mais espaço. O padrão para treinamento.
- **8 bits:** precisão média, ocupa metade do espaço.
- **4 bits (NF4):** precisão reduzida, ocupa um quarto do espaço. Suficiente para muitas tarefas.

Um modelo de 8B parâmetros em bf16 ocupa cerca de 16 GB. Em 4 bits, ocupa cerca de 5 GB. A diferença é enorme.

A quantização 4 bits (NF4) é o que permite que um Llama-8B rode em uma placa de vídeo de 4 GB usando layer streaming. Sem ela, o mesmo modelo exigiria pelo menos 16 GB de VRAM.

## O que é GPU e por que não basta qualquer placa

GPU (Graphics Processing Unit) é a placa de vídeo. Originalmente criada para jogos, ela é excelente para os cálculos matemáticos que o treinamento de IA exige.

Nem toda GPU é boa para IA. O que importa:

- **VRAM:** já falamos. Mais é melhor.
- **Núcleos CUDA:** são os processadores dentro da GPU da NVIDIA que fazem os cálculos. Mais núcleos = mais velocidade.
- **Gerações:** placas mais novas têm tecnologia melhor. Uma RTX 4090 é muito mais rápida que uma RTX 2060.

Se você tem um Mac com Apple Silicon (M1, M2, M3, M4), a história é diferente. A memória é unificada: CPU e GPU compartilham a mesma RAM. Você não tem uma placa de vídeo separada, mas os 32 GB de memória do Mac Mini M4 funcionam como se fossem VRAM e RAM ao mesmo tempo.

## O que é dataset

Dataset é o conjunto de dados que você usa para treinar o modelo. É o "material de estudo" do fine-tuning.

Um dataset para fine-tuning é uma lista de exemplos no formato "pergunta e resposta". Cada linha contém uma instrução e a resposta esperada. Por exemplo:

```
Pergunta: O que é LoRA?
Resposta: LoRA é uma técnica que permite fine-tuning de modelos grandes com menos memória.
```

A qualidade do dataset é mais importante que a quantidade. Mil exemplos bons valem mais que cem mil exemplos mal escritos.

## O que é SFT

SFT significa Supervised Fine-Tuning, ou Fine-tuning Supervisionado. É o método mais básico e comum.

Você mostra exemplos para o modelo (pares de pergunta e resposta) e ele aprende a reproduzir esse padrão. É como dar gabaritos para o modelo estudar.

Se você tem uma base de conhecimento da sua empresa com perguntas frequentes e respostas, você usa SFT para ensinar o modelo a responder como um especialista da sua área.

## O que é DPO

DPO significa Direct Preference Optimization. É um método mais avançado que SFT.

Em vez de mostrar a resposta certa, você mostra duas respostas: uma boa e uma ruim. O modelo aprende a preferir a boa e rejeitar a ruim.

É como dizer para o chef: "esta massa ficou boa, esta outra ficou salgada demais. Descubra a diferença e acerte na próxima."

DPO é usado para alinhar o modelo com preferências humanas: respostas mais úteis, mais educadas, mais seguras.

Outros métodos similares: ORPO, SimPO, KTO. São variações da mesma ideia com pequenas diferenças técnicas.

## O que são hiperparâmetros

Hiperparâmetros são as configurações que você ajusta antes de começar o treinamento. Eles controlam como o modelo aprende.

Os principais:

- **Epochs:** quantas vezes o modelo vai ver o dataset completo. Mais epochs = mais tempo de treino.
- **Learning rate (lr):** a velocidade com que o modelo aprende. Muito alto, ele não fixa o conhecimento. Muito baixo, leva uma eternidade.
- **Batch size:** quantos exemplos o modelo processa de uma vez. Maior batch = mais memória, mas treino mais estável.
- **Sequence length (max_length):** o tamanho máximo de cada texto que o modelo processa.

Ajustar hiperparâmetros é mais arte que ciência. Ferramentas como o Soup fazem isso automaticamente na maioria dos casos.

## O que é YAML

YAML é um formato de arquivo de configuração. Em vez de escrever comandos complexos no terminal, você escreve um arquivo simples com opções organizadas.

Um arquivo YAML se parece com isto:

```yaml
modelo: Llama-8B
tarefa: SFT
épocas: 3
taxa_de_aprendizado: 0.00002
quantização: 4bits
```

É uma forma de dizer ao programa o que você quer de forma organizada, sem precisar decorar comandos.

## O que é GGUF

GGUF é um formato de arquivo para salvar modelos de IA de forma otimizada. Ele foi criado pelo projeto llama.cpp.

Quando você termina o fine-tuning e quer usar o modelo em ferramentas como Ollama ou LM Studio, você precisa exportar o modelo para GGUF. É como salvar um arquivo em PDF em vez de deixar no formato original do editor de texto.

GGUF suporta diferentes níveis de quantização (q4_k_m, q5_k_m, q8_0, etc.), que indicam o equilíbrio entre tamanho e qualidade.

## O que é layer streaming

Layer streaming é uma técnica relativamente nova que permite treinar modelos que não cabem na sua placa de vídeo.

Normalmente, o modelo inteiro precisa estar na VRAM para ser treinado. Layer streaming mantém o modelo na RAM do computador e copia apenas uma pequena parte de cada vez para a VRAM. É como ler um livro grande página por página em vez de tentar segurar o livro inteiro aberto na sua mesa.

O Soup CLI implementa essa técnica e é o motivo pelo qual você pode fine-tunar um Llama-8B em uma placa de 4 GB.

## E como tudo se encaixa?

Aqui está o fluxo completo do fine-tuning, do começo ao fim, com os termos que aprendemos:

1. Você escolhe um **modelo base** (ex: Llama-3.1-8B) que já foi pré-treinado com bilhões de textos
2. Você prepara um **dataset** com exemplos do que quer ensinar (formato pergunta/resposta)
3. Você cria um arquivo **YAML** com as configurações: qual modelo, qual tarefa (**SFT** ou **DPO**), os **hiperparâmetros** e o nível de **quantização**
4. Você aplica **LoRA** para que apenas uma pequena parte do modelo seja treinada, economizando memória
5. Se o modelo não couber na sua **VRAM**, você ativa o **layer streaming**
6. O treinamento roda na sua **GPU**, e o resultado é um arquivo **LoRA** (adaptador) pequeno
7. Você pode **mesclar** o adaptador ao modelo base e **exportar** para **GGUF** para usar no Ollama

Tudo isso cabe em um comando só com ferramentas como o Soup. Mas por trás desse comando, cada um desses termos representa uma decisão de engenharia que torna o fine-tuning possível em hardware que você já tem em casa.

## Um resumo rápido

| Termo | O que é (de forma simples) |
|---|---|
| **LLM** | Um modelo de IA que entende e gera texto |
| **Fine-tuning** | Ensinar uma habilidade nova a um modelo já treinado |
| **LoRA** | Técnica que permite fine-tuning usando muito menos memória |
| **VRAM** | A memória da placa de vídeo, onde o modelo trabalha |
| **GPU** | A placa de vídeo, que faz os cálculos pesados |
| **Quantização** | Reduzir o tamanho do modelo com pouca perda de qualidade |
| **Dataset** | O conjunto de exemplos usados para treinar |
| **SFT** | Fine-tuning com exemplos de pergunta e resposta certa |
| **DPO** | Fine-tuning com pares de resposta boa e ruim |
| **Hiperparâmetros** | Configurações que controlam como o treinamento acontece |
| **YAML** | Um arquivo de configuração simples e organizado |
| **GGUF** | Formato de arquivo para usar modelos em ferramentas como Ollama |
| **Layer streaming** | Técnica que permite treinar modelos grandes em placas com pouca VRAM |
| **Batch size** | Quantos exemplos o modelo processa por vez |
| **Epoch** | Quantas vezes o modelo vê o dataset completo |

## Conclusão

O mundo do fine-tuning de IA parece cheio de siglas e termos complicados, mas cada um deles resolve um problema específico. LoRA existe porque VRAM é cara. Quantização existe porque modelos são grandes demais. Layer streaming existe porque nem todo mundo tem uma GPU de servidor.

Entender esses termos não é necessário para usar ferramentas como Soup, que automatizam quase tudo. Mas ajuda a saber o que está acontecendo quando algo dá errado, ou quando você precisa decidir entre uma configuração e outra.

Comece com SFT e um dataset pequeno. Depois de alguns fine-tunings, os termos que hoje parecem confusos vão fazer todo o sentido.