---
title: "Como Usar LLMs Gratuitos na Cloudflare Workers AI"
description: "Guia completo para executar modelos de linguagem de grande porte no tier gratuito da Cloudflare sem gerenciar GPUs."
publishDate: 2026-07-30
author: "Alicino"
category: "Inteligência artificial"
tags: ["cloudflare", "llm", "workers-ai", "tutorial", "ia-generativa"]
draft: false
---

A Cloudflare oferece acesso gratuito a modelos de linguagem de grande porte através do Workers AI. Esta plataforma serverless permite executar inferências de IA sem gerenciar GPUs ou infraestrutura complexa. Este artigo explica como começar, quais modelos estão disponíveis, as limitações do plano gratuito e exemplos práticos de uso.

## O que é o Workers AI

O Workers AI é uma plataforma da Cloudflare que executa modelos de machine learning em GPUs serverless distribuídas globalmente. Você pode invocar modelos a partir de Workers, Pages ou qualquer lugar via API REST. A plataforma está disponível tanto no plano gratuito quanto no pago da Cloudflare.

## Como Começar

Para usar o Workers AI no tier gratuito, você precisa criar uma conta na Cloudflare. Após o cadastro, acesse o dashboard do Workers AI para obter seu Account ID e API token. O plano gratuito não exige cartão de crédito nem configuração de pagamento.

## Modelos Disponíveis no Tier Gratuito

A Cloudflare hospeda mais de 80 modelos open source que podem ser executados no tier gratuito. Os principais incluem:

1. **Meta Llama**: llama-3.2-1b, llama-3.2-3b, llama-3.1-8b, llama-3.1-70b, llama-3.3-70b, llama-4-scout
2. **DeepSeek**: deepseek-r1-distill-qwen-32b
3. **Google**: gemma-4-26b
4. **NVIDIA**: nemotron-3-120b
5. **Moonshot AI**: kimi-k2.6, kimi-k2.7-code
6. **Zhipu AI**: glm-4.7-flash, glm-5.2
7. **OpenAI**: gpt-oss-120b

Os modelos suportam diversas tarefas: geração de texto, embeddings, classificação de texto, tradução, reconhecimento de fala, geração de imagens, classificação de imagens e detecção de objetos.

## Limitações do Plano Gratuito

O tier gratuito do Workers AI inclui **10.000 Neurons por dia** sem custo. Neurons são a unidade de medida do compute de GPU necessário para executar uma requisição. Este limite é suficiente para experimentação e projetos de pequeno porte.

As limitações de rate limit variam por tipo de tarefa. Modelos em beta podem ter limites mais baixos enquanto a Cloudflare trabalha em performance e escala. Os limites resetam diariamente às 00:00 UTC. Se exceder o limite, as operações subsequentes falharão com erro.

## Preços e Upgrade

O Workers AI é cobrado a **0,011 dólares por 1.000 Neurons**. No plano pago, você mantém os 10.000 Neurons diários gratuitos e paga apenas pelo uso acima deste limite. O monitoramento de consumo pode ser feito no dashboard do Workers AI.

## Benefícios e Vantagens

1. **Serverless**: não é necessário provisionar, escalar ou gerenciar GPUs
2. **Global**: a rede da Cloudflare executa modelos próximo aos usuários finais
3. **Open source**: acesso a modelos de ponta sem vendor lock-in
4. **Custo zero para começar**: 10.000 Neurons diários permitem experimentação robusta
5. **API compatível**: endpoints compatíveis com OpenAI facilitam migração
6. **Integração nativa**: funciona diretamente com Workers, Pages, KV, R2 e D1

## Exemplo Prático com REST API

Para executar um modelo via API REST, você precisa do Account ID e do API token. O endpoint base é:

```
https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{MODEL_NAME}
```

Exemplo de requisição com cURL para o modelo Llama 3.1 8B:

```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct" \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "Where did the phrase Hello World come from" }'
```

A resposta retorna o texto gerado pelo modelo:

```json
{
  "result": {
    "response": "Hello, World first appeared in 1974 at Bell Labs when Brian Kernighan included it in the C programming language example. It became widely used as a basic test program due to simplicity and clarity."
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## Exemplo com Workers Binding

Você também pode chamar modelos diretamente de um Worker usando bindings:

```javascript
export default {
  async fetch(request, env) {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: 'What is the capital of France?'
    });
    return new Response(JSON.stringify(response));
  }
};
```

## Considerações Importantes

O tier gratuito é ideal para prototipagem, aprendizado e aplicações de baixo tráfego. Para cargas de produção ou alto volume, o upgrade para o plano pago é necessário. Note que inferências em modo local usando Wrangler também contam para os limites diários.

## Conclusão

A Cloudflare Workers AI oferece uma entrada gratuita e acessível ao mundo dos large language models. Com 10.000 Neurons diários, dezenas de modelos open source e integração serverless, a plataforma elimina barreiras de infraestrutura para desenvolvedores. Crie sua conta, obtenha suas credenciais e comece a experimentar IA generativa sem custo inicial.
