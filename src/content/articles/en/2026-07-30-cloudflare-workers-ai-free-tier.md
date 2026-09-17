---
title: "How to Use Free LLMs on Cloudflare Workers AI"
description: "Complete guide to running large language models on Cloudflare's free tier without managing GPUs."
publishDate: 2026-07-30
author: "Alicino"
category: "Inteligência Artificial"
tags: ["Cloudflare", "LLM", "workers-ai", "tutorial", "generative-ai"]
draft: false
---

Cloudflare offers free access to large language models through Workers AI. This serverless platform lets you run AI inference without managing GPUs or complex infrastructure. This article explains how to get started, which models are available, the free tier limits, and practical usage examples.

## What is Workers AI

Workers AI is a Cloudflare platform that runs machine learning models on serverless GPUs distributed globally. You can invoke models from Workers, Pages, or anywhere via REST API. The platform is available on both the free and paid Cloudflare plans.

## Getting Started

To use Workers AI on the free tier, you need to create a Cloudflare account. After signing up, access the Workers AI dashboard to get your Account ID and API token. The free plan does not require a credit card or payment setup.

## Available Models on the Free Tier

Cloudflare hosts over 80 open source models that can run on the free tier. Key models include:

1. **Meta Llama**: llama-3.2-1b, llama-3.2-3b, llama-3.1-8b, llama-3.1-70b, llama-3.3-70b, llama-4-scout
2. **DeepSeek**: deepseek-r1-distill-qwen-32b
3. **Google**: gemma-4-26b
4. **NVIDIA**: nemotron-3-120b
5. **Moonshot AI**: kimi-k2.6, kimi-k2.7-code
6. **Zhipu AI**: glm-4.7-flash, glm-5.2
7. **OpenAI**: gpt-oss-120b

Models support various tasks: text generation, embeddings, text classification, translation, speech recognition, image generation, image classification, and object detection.

## Free Tier Limits

The Workers AI free tier includes **10,000 Neurons per day** at no cost. Neurons are the compute unit for the GPU needed to execute a request. This limit is sufficient for experimentation and small projects.

Rate limits vary by task type. Models in beta may have lower limits while Cloudflare works on performance and scale. Limits reset daily at 00:00 UTC. If you exceed the limit, subsequent operations will fail with an error.

## Pricing and Upgrade

Workers AI is charged at **$0.011 per 1,000 Neurons**. On the paid plan, you keep the 10,000 daily free Neurons and only pay for usage above this limit. You can monitor consumption in the Workers AI dashboard.

## Benefits and Advantages

1. **Serverless**: no need to provision, scale, or manage GPUs
2. **Global**: Cloudflare's network runs models close to end users
3. **Open source**: access to cutting-edge models without vendor lock-in
4. **Free to start**: 10,000 daily Neurons allow robust experimentation
5. **Compatible API**: OpenAI-compatible endpoints ease migration
6. **Native integration**: works directly with Workers, Pages, KV, R2, and D1

## Practical Example with REST API

To run a model via REST API, you need your Account ID and API token. The base endpoint is:

```
https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{MODEL_NAME}
```

Example cURL request for the Llama 3.1 8B model:

```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct" \
  -H "Authorization: Bearer ***" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "Where did the phrase Hello World come from" }'
```

The response returns the generated text:

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

## Example with Workers Binding

You can also call models directly from a Worker using bindings:

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

## Important Considerations

The free tier is ideal for prototyping, learning, and low-traffic applications. For production or high-volume workloads, upgrading to the paid plan is necessary. Note that local inference using Wrangler also counts toward daily limits.

## Conclusion

Cloudflare Workers AI offers a free and accessible entry point into the world of large language models. With 10,000 daily Neurons, dozens of open source models, and serverless integration, the platform removes infrastructure barriers for developers. Create an account, get your credentials, and start experimenting with generative AI at no initial cost.