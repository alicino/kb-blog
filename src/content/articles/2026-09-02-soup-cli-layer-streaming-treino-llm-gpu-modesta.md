---
title: "Soup CLI: treine modelos de IA que não cabem na sua GPU usando layer streaming"
description: "Conheça o Soup, uma ferramenta open source que permite fine-tuning de LLMs de até 8B parâmetros em GPUs de apenas 4 GB. Instalação, configuração, treinamento e serving."
publishDate: 2026-09-02
author: "Alicino"
category: "Inteligência Artificial"
tags: ["Soup", "layer streaming", "fine-tuning", "LLM", "LoRA", "treinamento", "GPU", "machine learning", "open source"]
draft: false
---

Você tem uma placa de vídeo com 4, 6 ou 8 GB de VRAM. Um notebook gamer, um desktop com uma RTX 2060 Super, ou um Mac Mini M4 com 32 GB de memória unificada. Você quer treinar ou ajustar um modelo de linguagem grande, mas descobre que o modelo não cabe na sua GPU.

A resposta usual para esse problema tem três opções: quantizar mais (e perder qualidade), alugar uma GPU na nuvem (e pagar por hora), ou desistir.

O Soup CLI oferece uma quarta opção: nunca carregar o modelo inteiro na VRAM.

## O que é o Soup

Soup é um toolkit open source para fine-tuning de LLMs, construído pela empresa MePlay, Inc. e disponível sob licença Apache-2.0. O site oficial é [trysoup.dev](https://trysoup.dev/) e o repositório está em [github.com/MakazhanAlpamys/Soup](https://github.com/MakazhanAlpamys/Soup).

O Soup não é apenas mais um wrapper para fine-tuning. Ele tem duas propostas de valor distintas:

A primeira é a automação do fluxo de post-training. Com um único arquivo YAML de configuração, você define o modelo base, a tarefa (SFT, DPO, ORPO, KTO, e mais 19 métodos), os dados e os hiperparâmetros. O Soup detecta sua GPU, escolhe o batch size ideal, aplica quantização e começa o treinamento. Um comando só.

A segunda, e mais inovadora, é o **layer streaming**. Uma técnica que permite treinar modelos que não cabem na sua GPU mantendo o modelo base congelado na RAM do computador e copiando apenas uma camada por vez para a VRAM.

A versão atual é a v0.73.2, e o layer streaming está em BETA desde a v0.72.0.

## O que é layer streaming

Layer streaming resolve o problema fundamental do fine-tuning em hardware modesto. Quando você treina um modelo com LoRA (Low-Rank Adaptation), apenas os adaptadores LoRA precisam de gradientes e otimizador. O modelo base fica congelado. Mas ele ainda precisa estar na VRAM para que os cálculos de forward e backward aconteçam.

O layer streaming diz: se o modelo base está congelado, por que mantê-lo inteiro na VRAM?

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

O Soup faz o seguinte:

1. O modelo base é convertido em um arquivo por camada decoder (shards safetensors) e mantido na RAM do sistema ou em disco NVMe
2. Apenas os adaptadores LoRA, os gradientes e o estado do otimizador ficam residentes na VRAM (são pequenos)
3. Durante o treinamento, cada camada decoder é copiada da RAM para um pequeno pool de buffers pré-alocados na VRAM, um por vez
4. A carga da camada seguinte acontece em uma stream CUDA dedicada, sobrepondo-se ao cálculo da camada atual (double-buffering)

O resultado é que o pico de VRAM é limitado pelo tamanho de **uma camada**, não do modelo inteiro. Com quantização NF4 (NormalFloat4), que reduz o armazenamento em cerca de 4x, um Llama-3.1-8B cabe em 3,32 GB de VRAM.

## Números reais em três cenários de hardware

O layer streaming foi desenvolvido e medido em uma RTX 3050 Laptop de 4 GB. Mas você pode ter um hardware diferente, e o que muda é quanta margem você tem. Abaixo, três cenários que cobrem desde o hardware mínimo até máquinas mais confortáveis.

### Cenário A: RTX 3050 Laptop 4 GB (o hardware de referência)

Esta é a placa usada pela documentação oficial do Soup. Os benchmarks abaixo foram medidos nela, rodando Windows:

| Modelo | Quantização | Throughput | Pico VRAM | RAM |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct | NF4 | 119,6 tok/s | 3,32 GB | 3,60 GB |
| Qwen2.5-3B | NF4 | 264,2 tok/s | 1,76 GB | 1,43 GB |
| Qwen2.5-3B | bf16 | 143,1 tok/s | 2,15 GB | 5,55 GB |
| Qwen2.5-1.5B | bf16 | 525,0 tok/s | 1,82 GB | — |
| Qwen2.5-0.5B | bf16 | 978,6 tok/s | 1,47 GB | — |

Com 4 GB de VRAM e layer streaming NF4, você fine-tuna um Llama-3.1-8B com 119,6 tokens por segundo. O modelo cabe com folga (3,32 GB de pico), e o custo é 1,43x mais lento que o treinamento residente.

### Cenário B: RTX 2060 Super 8 GB (seu desktop)

A RTX 2060 Super tem 8 GB de VRAM GDDR6, 2176 núcleos CUDA e arquitetura Turing (compute capability 7.5). É uma placa de 2019, mas perfeitamente capaz para fine-tuning com Soup.

Com 8 GB, você tem duas opções:

**Sem layer streaming (modo residente).** Modelos de até 3B cabem inteiros na VRAM com quantização NF4. Um Qwen2.5-3B ocupa cerca de 1,76 GB, então sobra espaço para batch size maior e sequências mais longas. O treinamento roda na velocidade máxima da placa.

**Com layer streaming.** Você pode fine-tunar modelos de 8B (Llama-3.1, Qwen3, Mistral) em NF4 com bastante margem. O pico medido de 3,32 GB para um 8B deixa mais da metade da VRAM livre, o que permite aumentar `batch_size` sem preocupação. O throughput será limitado pela transferência host-to-device, não pela GPU, então a RTX 2060 Super não será significativamente mais rápida que a RTX 3050 Laptop no streaming. O ganho real está em poder usar batch size maior.

| Carga | VRAM ocupada | Recomendação |
|---|---|---|
| Qwen2.5-3B residente NF4 | ~1,8 GB | Sem streaming, batch alto |
| Llama-3.1-8B streaming NF4 | ~3,3 GB | Streaming com batch 8+ |
| Qwen3-14B streaming NF4 | ~4,5 GB | Streaming, batch controlado |
| DPO/ORPO em 8B streaming | ~3,7 GB | Streaming com preferência |

### Cenário C: Mac Mini M4 32 GB (seu segundo hardware)

O Mac Mini M4 tem 32 GB de memória unificada e 120 GB/s de banda. A grande vantagem do Apple Silicon é que CPU e GPU compartilham a mesma memória, então não existe o custo de cópia host-to-device que o layer streaming tenta esconder.

No entanto, o Soup tem suporte a Apple Silicon via backend MPS (Metal Performance Shaders), que é classificado como experimental. O backend MLX (nativo Apple) também está disponível via `pip install "soup-cli[mlx]"`, mas o layer streaming não funciona com MLX. Ele é um mecanismo CUDA.

O que isso significa na prática:

**Se você usar o Soup no Mac Mini M4 (backend CUDA não disponível), o layer streaming não se aplica.** O Soup roda via MPS ou MLX, e modelos de até 8B cabem inteiros na memória unificada de 32 GB sem precisar de streaming. Um Llama-3.1-8B em bf16 ocupa cerca de 16 GB, deixando 16 GB livres para o sistema. Com NF4, cai para aproximadamente 5 GB.

**Se você quiser a experiência de fine-tuning otimizada para Apple Silicon**, o MLX (fora do Soup) é a ferramenta certa. Com `mlx-lm`, você fine-tuna modelos de 8B em bf16 sem streaming, aproveitando a memória unificada. O throughput de inferência no M4 é de cerca de 30-40 tok/s para modelos 8B em bf16, e o fine-tuning LoRA roda confortavelmente dentro de 32 GB.

| Abordagem | Modelo máximo | Notas |
|---|---|---|
| Soup + MPS (experimental) | 3B-8B NF4 | Sem streaming, sem garantia de performance |
| Soup + MLX backend | 8B-14B NF4 | Streaming não disponível, mas modelo cabe |
| MLX direto (mlx-lm) | 8B bf16 | Fine-tuning LoRA nativo, 32 GB suficientes |
| Ollama + MLX preview | Inferência 8B-30B | Roda Qwen3.6 35B-A3B em 22 GB (NF4) |

Em agosto de 2026, a técnica foi validada externamente em um cluster 8x H100, confirmando a exatidão do forward pass até 72B parâmetros e encontrando um defeito no gradiente NF4 acima de 165 MB por camada decoder, corrigido na v0.73.0.

## O que você pode treinar com Soup

O Soup suporta 23 métodos de treinamento:

| Tarefa | Descrição |
|---|---|
| SFT | Supervised Fine-Tuning (instrução) |
| DPO | Direct Preference Optimization |
| ORPO | Odds Ratio Preference Optimization |
| SimPO | Simple Preference Optimization |
| KTO | Kahneman-Tversky Optimization |
| GRPO | Group Relative Policy Optimization (DeepSeek-R1) |
| PPO | Proximal Policy Optimization (RLHF) |
| IPO, BCO | Outras variações de preferência |
| Reward Model | Modelo de recompensa para RLHF |
| PRM | Process Reward Model |
| Pretrain | Pré-treinamento contínuo |
| TTS | Text-to-Speech |
| ASR | Automatic Speech Recognition (Whisper) |
| Distill, Unlearn, MoE, e outros | Técnicas avançadas |

Destes, os que funcionam com layer streaming são: **SFT, DPO, ORPO, SimPO e KTO**. GRPO e PPO são explicitamente excluídos porque precisam gerar texto durante o treinamento (rollouts), o que exigiria ler todas as camadas para cada token gerado, destruindo a economia do streaming.

## Arquiteturas suportadas no streaming

Nove arquiteturas de modelos são suportadas e verificadas como bit-exatas contra a execução residente:

- Llama (Llama 2, 3, 3.1)
- Qwen2, Qwen3
- Mistral
- Gemma, Gemma 2, Gemma 3 (texto apenas)
- Phi, Phi-3

Cada uma foi verificada em bf16 e NF4 com diferença máxima de logits de 0,000. Ou seja, o streaming produz exatamente o mesmo resultado que carregar o modelo inteiro.

## Instalação

O Soup requer Python 3.10 a 3.12 e uma GPU CUDA (recomendado), Apple Silicon (MPS, experimental) ou CPU (experimental).

```bash
# Instalação mínima para treinar
pip install "soup-cli[train]"

# Com Unsloth (2-5x mais rápido em GPUs compatíveis)
pip install "soup-cli[fast]"

# Para Apple Silicon (M1-M4)
pip install "soup-cli[mlx]"

# Para servir o modelo treinado (API OpenAI-compatível)
pip install "soup-cli[serve]"
pip install "soup-cli[serve-fast]"   # vLLM backend
```

## Configuração para treinar com layer streaming

O Soup usa um único arquivo YAML. Aqui está um exemplo funcional para fine-tuning de um Llama-3.1-8B em uma GPU de 4 GB:

```yaml
# soup.yaml
base: meta-llama/Llama-3.1-8B-Instruct
task: sft
backend: transformers

data:
  train: ./dados.jsonl
  format: alpaca
  max_length: 512

training:
  epochs: 3
  lr: 2e-5
  batch_size: 4
  gradient_accumulation_steps: 2
  quantization: 4bit
  gradient_checkpointing: true
  stream_layers: true
  stream_source: auto
  stream_buffers: 2

lora:
  r: 64
  alpha: 16

output: ./output
```

Os parâmetros específicos do layer streaming:

- **`stream_layers: true`** ativa o streaming. Só use se o modelo não couber residente.
- **`stream_source: auto`** usa RAM se o modelo couber, fallback para NVMe se não couber. `ram` força RAM e recusa se não couber. `disk` força NVMe.
- **`stream_buffers: 2`** número de buffers VRAM no pool. 2 é double-buffering. Valores de 2 a 8.
- **`quantization: 4bit`** NF4. Reduz o armazenamento em ~4x. Essencial para colocar 8B em 4 GB.

O batch size precisa ser um número concreto. O valor `auto` é recusado porque a sonda de batch size precisa de um modelo residente, que nunca existe no streaming.

### Sobre batch size vs gradient accumulation

O Soup tem uma descoberta importante: no layer streaming, aumentar o batch size real é cerca de **2,52x mais rápido** que aumentar o gradient accumulation steps, para o mesmo batch efetivo. Isso acontece porque um batch real amortiza a leitura de cada camada sobre mais tokens, enquanto a acumulação relê o modelo inteiro a cada micro-batch.

A regra prática: aumente `batch_size` enquanto a VRAM permitir, e só então use `gradient_accumulation_steps` para o resto.

## Formato dos dados

O formato Alpaca é o mais simples para SFT. Cada linha do JSONL:

```json
{
  "instruction": "Explique o que é layer streaming.",
  "output": "Layer streaming é uma técnica que mantém..."
}
```

Para DPO, o formato inclui resposta escolhida e rejeitada:

```json
{
  "instruction": "Explique o que é layer streaming.",
  "chosen": "Layer streaming é uma técnica que mantém o modelo base na RAM...",
  "rejected": "Layer streaming é quando você compra mais GPUs."
}
```

## Executando o treinamento

```bash
soup train --config soup.yaml
```

O Soup faz o seguinte automaticamente:

1. Baixa o modelo base do Hugging Face (se não estiver em cache)
2. Converte o checkpoint em shards por camada decoder (uma vez só, em cache)
3. Aplica a quantização NF4 offline
4. Executa o pre-flight de VRAM e recusa se não couber
5. Treina com LoRA + layer streaming
6. Salva os adaptadores LoRA no diretório de saída

### Pré-requisitos de hardware

Para streaming de um Llama-3.1-8B em NF4, você precisa de:

- **GPU:** pelo menos 4 GB de VRAM (o pico medido é 3,32 GB)
- **RAM:** pelo menos 5,1 GB livres (o store NF4 do 8B tem ~3,6 GB, e o pre-flight recusa abaixo de store/0,7)
- **RAM paginável:** idealmente, que o sistema consiga page-lock o store (memória pinada). Se não conseguir, o throughput cai porque a cópia host-to-device vira síncrona. Fechar outros programas ajuda.
- **NVMe (opcional):** se o modelo não couber na RAM, o Soup pode streamar de disco NVMe. SATA SSD e HD são recusados porque o número de seeks por passo inviabiliza o treinamento.

O Soup tem um comando de diagnóstico:

```bash
soup doctor --disk
```

Isso reporta se o disco detectado é NVMe, SATA SSD, HDD ou desconhecido.

### O pre-flight de VRAM

Antes de começar o treinamento, o Soup calcula o pico de VRAM esperado e recusa se não couber. Isso é importante porque o layer streaming limita os pesos, mas não as ativações e o tensor de logits, que escalam com `batch_size` vezes `max_length`. Em modelos com vocabulário grande (151.936 tokens no Qwen), o tensor de logits sozinho pode chegar a 8,71 GB em batch 8.

Se o pre-flight recusar, você reduz `batch_size` ou `max_length`.

## Após o treinamento

Soup oferece vários comandos para usar o modelo treinado:

```bash
# Conversar com o modelo
soup chat --model ./output

# Servir como API compatível com OpenAI
soup serve --model ./output --backend vllm

# Mesclar adaptador LoRA no modelo base
soup merge --adapter ./output

# Exportar para GGUF (para Ollama / llama.cpp)
soup export --model ./output --format gguf --quant q4_k_m

# Fazer push para Hugging Face
soup push --model ./output --repo seu-usuario/seu-modelo
```

## Casos de uso

**O entusiasta com um notebook gamer.** Você tem um notebook com RTX 3050 4 GB e quer fine-tunar um Llama-3.1-8B para responder perguntas sobre a documentação da sua empresa. Antes, isso exigiria uma GPU na nuvem. Com Soup, você prepara um JSONL com exemplos, escreve um YAML de 20 linhas, e o treinamento roda no seu notebook em algumas horas.

**O pesquisador com orçamento limitado.** Você está testando hipóteses de alignment (DPO, ORPO, KTO) em modelos de 3B e 8B, mas não tem acesso a GPUs grandes. Com Soup + layer streaming, você testa diferentes configurações de preferência na sua máquina local, e só sobe para a nuvem quando precisa escalar.

**O desenvolvedor de aplicações com IA.** Você fine-tuna modelos para tarefas específicas (classificação, sumarização, chat) e precisa iterar rápido. Com Soup, cada experimento é um arquivo YAML diferente, e você compara resultados sem sair da sua máquina.

**No desktop com RTX 2060 Super 8 GB.** Você fine-tuna um Llama-3.1-8B-Instruct com dados de suporte técnico da sua empresa. O YAML usa `stream_layers: true` e `batch_size: 8`. O pre-flight confirma que cabe nos 8 GB. O treinamento roda por algumas horas enquanto você trabalha em outras coisas. O modelo resultante responde perguntas sobre a base de conhecimento da empresa com muito mais precisão que o modelo base.

**No Mac Mini M4 32 GB para experimentação rápida.** Você usa `mlx-lm` (fora do Soup) para fine-tunar um Qwen2.5-7B em bf16 com LoRA. O fine-tuning leva minutos para datasets pequenos. Você testa diferentes configurações de prompt, comparando respostas antes e depois do fine-tuning. Como a memória unificada de 32 GB é suficiente, não precisa se preocupar com streaming.

**No desktop para alinhamento por preferência (DPO).** Com a RTX 2060 Super, você coleta pares de resposta escolhida/rejeitada de usuários e fine-tuna um Mistral-7B com DPO + layer streaming. O pico de VRAM fica em ~3,7 GB (apenas 44 MB acima do SFT, porque o DPO reusa a mesma base streamada com adaptadores desligados). O modelo alinhado produz respostas mais alinhadas com as preferências dos seus usuários.

**No Mac Mini para inferência de modelos maiores.** Com Ollama + MLX preview, você roda Qwen3.6 35B-A3B (Mixture of Experts, 3B ativos por token) em NF4, ocupando cerca de 22 GB dos 32 GB disponíveis. O modelo serve como assistente local de codificação, com boa velocidade de inferência graças aos 120 GB/s de banda do M4.

## Limitações honestas

O layer streaming é BETA e tem limites claros:

- **É mais lento que treinamento residente.** 1,43x mais lento no melhor caso. Só ative quando o modelo realmente não couber.
- **Só funciona com `backend: transformers`, `modality: text`, LoRA comum.** Nada de Unsloth backend no streaming, nada de multimodal, nada de DoRA.
- **GRPO e PPO não funcionam com streaming.** Rollouts de geração exigem todas as camadas a cada token.
- **O pico de VRAM ainda depende de batch size e sequência.** O streaming limita os pesos, mas não as ativações e logits. Modelos com vocabulário grande exigem batch size baixo.
- **NVMe é obrigatório se a RAM não for suficiente.** SATA SSD e HD são recusados.
- **Nada acima de 8B foi medido em GPUs de 4 GB.** Os testes de 14B, 32B e 72B foram feitos em hardware de servidor (8x H100). Uma máquina de 4 GB não tem RAM host suficiente para o store de 32B (14,99 GB pinados).

## O preprint

O layer streaming tem um preprint acadêmico disponível no Zenodo:

> "Exact Layer Streaming: LoRA Fine-Tuning of an 8B Model on a 4 GB Laptop GPU" (v3). Makazhan, A. (2026). DOI: [10.5281/zenodo.21918325](https://doi.org/10.5281/zenodo.21918325).

O preprint documenta o protocolo de corretude que verifica a execução streamada contra a residente, incluindo a descoberta de um defeito de gradiente que só a comparação bit-exata revelou.

## Links úteis

- **Site oficial:** [trysoup.dev](https://trysoup.dev/)
- **Documentação:** [trysoup.dev/docs](https://trysoup.dev/docs)
- **Repositório GitHub:** [github.com/MakazhanAlpamys/Soup](https://github.com/MakazhanAlpamys/Soup)
- **Preprint (Zenodo):** [10.5281/zenodo.21918325](https://doi.org/10.5281/zenodo.21918325)
- **Documentação de instalação:** [trysoup.dev/docs/getting-started](https://trysoup.dev/docs/getting-started)
- **Documentação de layer streaming:** [trysoup.dev/docs/layer-streaming](https://trysoup.dev/docs/layer-streaming)
- **Validação externa (8x H100):** [trysoup.dev/docs/external-validation](https://trysoup.dev/docs/external-validation)

## Conclusão

O Soup não é o primeiro toolkit de fine-tuning, mas é o primeiro que torna prático treinar modelos de 8B parâmetros em GPUs de 4 GB sem sacrificar a exatidão dos gradientes. A técnica de layer streaming é engenhosa, o preprint é transparente sobre limitações e descobertas, e a ferramenta é usável com um único arquivo YAML.

Para quem tem hardware modesto e quer fine-tunar modelos reais sem depender de nuvem, o Soup merece uma tarde de testes.