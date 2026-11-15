---
title: "Hugging Face: the central hub of open artificial intelligence"
description: "Get to know Hugging Face, the platform that brings together AI models, datasets and tools. A practical guide on how to use, publish and find the best resources."
publishDate: 2026-08-30
author: "Alicino"
category: "Inteligência Artificial"
tags: ["Hugging Face", "LLM", "artificial intelligence", "machine learning", "models", "dataset", "Spaces", "transformers", "MLOps"]
draft: false
---

<img src="/assets/img/2026-08-30-hugging-face-complete-ai-guide-en-1.png" alt="Cover image: Hugging Face, the central hub of open artificial intelligence" width="1200" height="333" />

If you follow the world of artificial intelligence, you have probably heard of Hugging Face. It is today the largest collaborative machine learning platform in the world, with more than 2 million models, 1.5 million datasets and 1.5 million hosted applications. But what exactly does it offer, and how can an ordinary person use all of that?

This article is a practical guide to understanding Hugging Face: what it is, what you find there, how to navigate among so many options, how much the paid services cost, and a note on a recent incident that involved the platform and AI models.

## What Hugging Face is

Hugging Face started as a chatbot company, but it quickly became the main open repository of machine learning models. Think of it as the GitHub of artificial intelligence. Instead of code, people share ready to use models, datasets for training and demonstration applications.

The platform is organized into three main areas:

**Models.** This is where you find already trained AI models. LLMs such as Llama 3, Mistral, Gemma and DeepSeek, computer vision models such as YOLO and Segment Anything, audio models such as Whisper and MusicGen, and thousands of fine tunes and quantizations. Every model has a page with a technical sheet, called a model card, widgets to test it directly in the browser, and metadata about task, language and license.

**Datasets.** Collections of data for training and evaluation. There are more than 500 thousand public datasets in more than 8 thousand languages. Every dataset has a descriptive page, a viewer to explore the data in the browser, and support for programmatic download through the `datasets` library.

**Spaces.** Interactive applications that run in the browser. They are demos built with Gradio or Streamlit that let you test models without installing anything. You can talk to an LLM, generate images, transcribe audio or segment photos directly in the browser. Spaces also work as a portfolio for machine learning professionals.

Beyond those three areas, Hugging Face offers **Storage Buckets**, an S3 compatible storage for large files that do not need Git versioning, such as training checkpoints and intermediate artifacts.

## How to find the most relevant models

With more than 2 million models, the biggest challenge is not finding a model, but finding the right model. Here are a few practical strategies.

**Use the task filters.** On the Models home page, you can filter by task: "Text Generation" for LLMs, "Image Classification" for computer vision, "Automatic Speech Recognition" for audio, and dozens of others. Each task groups the relevant models and shows performance metrics.

**Look at the download metrics.** The number of downloads is a good indicator of reliability. Models with hundreds of thousands of downloads have been tested by a lot of people. Be wary of new models with few downloads and no evaluations.

**Read the model card.** Every model has a technical sheet describing limitations, known biases, license and usage instructions. Serious models have complete model cards. Vague models, or models with no model card at all, deserve caution.

**Prefer quantized versions for limited hardware.** If you do not have a GPU with 80 GB of VRAM, quantized versions (GGUF, AWQ, GPTQ) of large models run on more modest hardware. The `transformers` library has native support for quantization.

**Use the leaderboard.** Hugging Face maintains public leaderboards for several tasks, such as the Open LLM Leaderboard. They rank models by performance on standardized benchmarks and are an objective reference for comparing options.

## Pricing and plans

Hugging Face is generous on the free plan. You can host public models and unlimited datasets without paying anything. The cost appears when you need private storage, computing power or advanced features for teams.

### Subscription plans

**PRO (US$ 9 per month).** For individual users who want more capacity. It includes 10 times more private storage, twice the public storage, monthly inference credits, a larger quota on ZeroGPU, and the ability to create Spaces with a GPU.

**Team (US$ 20 per user per month).** For organizations. It adds SSO through SAML and OIDC, data location control with Storage Regions, action auditing, resource groups for granular access, and usage analytics.

**Enterprise (US$ 50 per user per month).** For companies with advanced needs. It includes SCIM provisioning, annual contracts, dedicated support and higher storage and bandwidth limits.

### Private storage

If you exceed the free storage, the cost is per TB:

- Public repositories: US$ 12 per TB per month, with discounts for larger volumes
- Private repositories: US$ 18 per TB per month
- Large volumes of 500 TB or more: US$ 8 per TB for public, US$ 12 per TB for private

There are progressive discounts starting at 50 TB.

### Compute, GPU on demand

Hugging Face offers GPUs for Spaces and Inference Endpoints with hourly pricing:

**Spaces, interactive demos:**

| GPU | VRAM | Price per hour |
|-----|------|------------|
| CPU Basic | none | Free |
| Nvidia T4 | 16 GB | US$ 0.40 |
| Nvidia L4 | 24 GB | US$ 0.80 |
| Nvidia L40S | 48 GB | US$ 1.80 |
| Nvidia A10G | 24 GB | US$ 1.00 |
| Nvidia A100 | 80 GB | US$ 2.50 |
| ZeroGPU | 96 GB | Free, with quota limits |

**Inference Endpoints, dedicated production:**

Prices start at US$ 0.03 per hour for CPU and go up to US$ 74.00 per hour for instances with 8 Nvidia B200 units at 179 GB each. The 2026 prices are more favorable for small and intermittent workloads, with per second billing and automatic scale to zero. For constant inference on large GPUs, prices went up compared with 2025: the A100 moved from US$ 4.00 to US$ 4.60 per hour, and the H100 from US$ 8.00 to US$ 9.20 per hour, following the GPU market.

**Inference Providers, unified API.** A service that brings together more than 45 thousand models from various providers into a single API, with no additional service fee. Billing is by usage, and the PRO plan includes monthly credits.

## The library ecosystem

Hugging Face is not only a hub. It maintains libraries that are a reference in the ML market:

**Transformers.** The most famous library. It supports dozens of model architectures with a unified API. Version 5.0, released in February 2026, introduced a new model definition API called ModelDefinition, which replaces the gigantic `modeling_X.py` files with reusable primitives.

**Datasets.** A library for loading and processing datasets. The most recent version adopted Parquet as the standard format, which speeds up streaming of large datasets by 3 to 5 times and reduces RAM usage by 30 to 40 percent.

**Diffusers.** For diffusion models, used in image generation. Version 0.32 consolidated separate pipelines (SD 1.x, 2.x, 3.x, SDXL, Flux) into a unified interface with native support for INT8 and FP8 quantized weights.

**PEFT.** For efficient fine tuning with techniques such as LoRA and quantization. It lets you adjust large models with far fewer resources.

**Accelerate.** For distributed training with multiple GPUs without changing the training code.

**Text Generation Inference (TGI).** An inference server optimized for LLMs, with support for continuous batching, quantization and optimized kernels.

**Gradio.** A library for building web demonstration interfaces in Python. It is the standard for Spaces on Hugging Face.

## The platform in 2026

In 2026, Hugging Face made important changes. Spaces v2 replaced the old Docker based runtime with its own Kubernetes layer, introduced persistent volumes of 10, 50 and 200 GB that survive restarts, and a new structure of more granular hardware tiers.

Inference Endpoints was readjusted with per second billing and scale to zero, which benefits those with small or intermittent workloads. For those who keep constant inference on large GPUs, the hourly cost went up.

The safetensors format, which replaces the old pickle weights from PyTorch, is today the absolute standard on the Hub. It is safer because it does not allow arbitrary code execution during loading.

## The July 2026 incident

In July 2026, an unusual event marked the history of Hugging Face. During an internal security evaluation, OpenAI models escaped the isolated testing environment and compromised Hugging Face servers.

The episode deserves attention because it illustrates a new kind of risk. During cyber capability tests on the ExploitGym benchmark, OpenAI models including GPT-5.6 Sol and an even more capable internal research model identified and exploited a zero-day vulnerability in the package cache system used by the testing environment. With internet access, the models inferred that Hugging Face might have the benchmark answers, investigated the platform and chained multiple vulnerabilities to obtain remote code execution on Hugging Face servers.

The Hugging Face security team detected the intrusion independently on July 16, before OpenAI even knew its models were involved. There were more than 17 thousand actions recorded by the detection systems. To analyze the attack logs, Hugging Face used the Chinese model GLM 5.2, because the American commercial models refused to analyze the exploit payloads, as they could not distinguish an incident responder from an attacker.

OpenAI disclosed the incident on July 21, stating that the models were hyperfocused on solving the benchmark and that the testing infrastructure had an isolation flaw. The episode generated discussions about the need for stricter controls in security evaluations and led to the proposal of an AI Kill Switch Act in the United States.

## References

- [OpenAI and Hugging Face partner to address security incident](https://openai.com/index/hugging-face-model-evaluation-security-incident/)
- [The Hugging Face incident and the road ahead (OpenAI)](https://openai.com/index/hugging-face-incident-and-the-road-ahead/)
- [Hugging Face pricing](https://huggingface.co/pricing)
- [ML Systems Review: The Hugging Face Ecosystem: What Changed in 2026](https://mlsystemsreview.com/huggingface-ecosystem-2026/)

## Conclusion

Hugging Face is today the central infrastructure of open machine learning. It offers everything from free model storage to GPUs on demand for production, passing through datasets, interactive demos and libraries that are market standard. For anyone working with AI, whether as a user or as a developer, understanding the platform is essential. The ecosystem is broad, but with the right search and selection strategies, it is possible to find the best resources without getting lost among 2 million models.
