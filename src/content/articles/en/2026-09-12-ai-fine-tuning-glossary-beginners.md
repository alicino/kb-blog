---
title: "AI fine-tuning for beginners: what every term you see out there actually means"
description: "A simple, direct guide to the terms used in AI model fine-tuning: LLM, LoRA, quantization, GPU, VRAM, dataset, SFT, DPO and much more."
publishDate: 2026-09-12
author: "Alicino"
category: "Inteligência Artificial"
tags: ["fine-tuning", "beginners", "LLM", "LoRA", "quantization", "GPU", "glossary", "AI", "learning"]
draft: false
---

<img src="/assets/img/2026-09-12-ai-fine-tuning-glossary-beginners-en-1.png" alt="AI fine-tuning glossary cover: the terms of AI model tuning explained without jargon" width="1200" height="333" />

If you are starting to explore the world of artificial intelligence models,
you have probably run into sentences like this:

> "With a YAML file you define the base model, the SFT or DPO task, the
> hyperparameters, apply quantization and start training."

If you read that and thought "I understood nothing", this article is for you.

We will explain each of those terms simply, as if we were just talking. By the
end you will understand what each piece means and why it matters.

## What an AI model (or LLM) is

An AI model is a computer program that was trained on an immense amount of text
to learn patterns of human language. It does not "think" like a person, but it
learned the probability of one word coming after another.

LLM stands for Large Language Model. They are models with billions of
parameters. A parameter is like an internal "adjustment knob" of the model. The
more parameters, the more complex the model tends to be.

To give you an idea:

- A small model: 500 million parameters (0.5B)
- A medium model: 3 billion parameters (3B)
- A large model: 8 billion parameters (8B)
- A very large model: 70 billion parameters (70B)

Each parameter takes up space in the computer's memory. That is why large
models need powerful video cards.

Examples of famous LLMs: Llama (Meta), Qwen (Alibaba), Mistral, Gemma (Google),
GPT (OpenAI).

## What fine-tuning is

Fine-tuning is the process of taking a model that has already been trained and
"adjusting" it for a specific task.

Imagine you hired a chef who knows how to cook everything (that is the base
model). Fine-tuning would be like giving them an intensive course in Italian
cuisine. They still know how to cook everything, but now they understand pasta
and sauces far better.

In practice, fine-tuning is when you take a generic model and train it on your
own data so it specializes in your subject.

## What LoRA is

LoRA (Low-Rank Adaptation) is a technique that makes fine-tuning much lighter.

Back to the chef example: instead of teaching everything again (which would be
expensive and slow), you give them a small Italian recipe notebook. The chef
stays the same, but now has a complement that helps with Italian cooking.

Technically, LoRA creates small adapters that are trained while the original
base model stays frozen. That drastically reduces the amount of memory needed
and the training time.

Without LoRA, training a model with 8 billion parameters would require a video
card with more than 60 GB of VRAM. With LoRA, you can do the same fine-tuning
on an 8 GB card.

At the end of training, LoRA produces a small file (the adapter) you can share
or apply to the base model when you use it.

## What VRAM is and why it matters

VRAM is the memory of the video card (GPU). It is different from your
computer's RAM.

When you train or use an AI model, it has to be loaded into the GPU's VRAM.
That is where the calculations happen. The more VRAM your card has, the larger
the models you can run.

- 4 GB of VRAM: very small models, or large models with special techniques
- 8 GB of VRAM: models up to 3B parameters without tricks, or 8B with LoRA
- 12 GB of VRAM: 7B models comfortably
- 24 GB of VRAM (RTX 3090/4090): models from 13B to 30B with quantization

If the model does not fit in your VRAM, you cannot train. That is why
techniques like LoRA and layer streaming exist.

## What quantization is

Quantization is a technique to reduce the size of a model without losing much
quality.

Think of a photo. A high quality RAW photo takes up a lot of space. A
compressed JPEG photo takes up less, but is still nice to look at. Quantization
is like converting the model from RAW to JPEG.

The numbers that make up the model's parameters can be stored with different
levels of precision:

- **bf16** (16 bits): high precision, takes up more space. The standard for
  training.
- **8 bits:** medium precision, takes up half the space.
- **4 bits (NF4):** reduced precision, takes up a quarter of the space. Enough
  for many tasks.

A model with 8B parameters in bf16 takes up about 16 GB. In 4 bits, it takes up
about 5 GB. The difference is enormous.

4-bit quantization (NF4) is what allows a Llama-8B to run on a 4 GB video card
using layer streaming. Without it, the same model would require at least 16 GB
of VRAM.

## What a GPU is and why not just any card will do

GPU (Graphics Processing Unit) is the video card. Originally created for games,
it is excellent for the mathematical calculations that AI training requires.

Not every GPU is good for AI. What matters:

- **VRAM:** we already covered it. More is better.
- **CUDA cores:** these are the processors inside NVIDIA's GPU that do the
  calculations. More cores = more speed.
- **Generations:** newer cards have better technology. An RTX 4090 is much
  faster than an RTX 2060.

If you have a Mac with Apple Silicon (M1, M2, M3, M4), the story is different.
The memory is unified: CPU and GPU share the same RAM. You do not have a
separate video card, but the 32 GB of memory in the Mac Mini M4 work as if they
were VRAM and RAM at the same time.

## What a dataset is

A dataset is the set of data you use to train the model. It is the "study
material" of fine-tuning.

A dataset for fine-tuning is a list of examples in a "question and answer"
format. Each line contains an instruction and the expected answer. For example:

```
Question: What is LoRA?
Answer: LoRA is a technique that allows fine-tuning large models with less memory.
```

The quality of the dataset matters more than the quantity. A thousand good
examples are worth more than a hundred thousand badly written ones.

## What SFT is

SFT stands for Supervised Fine-Tuning. It is the most basic and common method.

You show examples to the model (question and answer pairs) and it learns to
reproduce that pattern. It is like giving answer keys for the model to study.

If you have a knowledge base from your company with frequently asked questions
and answers, you use SFT to teach the model to answer like a specialist in your
field.

## What DPO is

DPO stands for Direct Preference Optimization. It is a more advanced method
than SFT.

Instead of showing the right answer, you show two answers: a good one and a bad
one. The model learns to prefer the good one and reject the bad one.

It is like telling the chef: "this pasta turned out good, that other one was
too salty. Figure out the difference and get it right next time."

DPO is used to align the model with human preferences: more useful, more
polite, safer answers.

Other similar methods: ORPO, SimPO, KTO. They are variations of the same idea
with small technical differences.

## What hyperparameters are

Hyperparameters are the settings you adjust before starting training. They
control how the model learns.

The main ones:

- **Epochs:** how many times the model will see the complete dataset. More
  epochs = more training time.
- **Learning rate (lr):** the speed at which the model learns. Too high and it
  does not retain the knowledge. Too low and it takes forever.
- **Batch size:** how many examples the model processes at once. Larger batch =
  more memory, but more stable training.
- **Sequence length (max_length):** the maximum size of each text the model
  processes.

Tuning hyperparameters is more art than science. Tools like Soup do it
automatically in most cases.

## What YAML is

YAML is a configuration file format. Instead of writing complex commands in the
terminal, you write a simple file with organized options.

A YAML file looks like this:

```yaml
model: Llama-8B
task: SFT
epochs: 3
learning_rate: 0.00002
quantization: 4bits
```

It is a way of telling the program what you want in an organized form, without
having to memorize commands.

## What GGUF is

GGUF is a file format for saving AI models in an optimized way. It was created
by the llama.cpp project.

When you finish fine-tuning and want to use the model in tools like Ollama or
LM Studio, you need to export the model to GGUF. It is like saving a file as
PDF instead of leaving it in the word processor's original format.

GGUF supports different quantization levels (q4_k_m, q5_k_m, q8_0, etc.), which
indicate the balance between size and quality.

## What layer streaming is

Layer streaming is a relatively new technique that lets you train models that do
not fit in your video card.

Normally the whole model needs to be in VRAM to be trained. Layer streaming
keeps the model in the computer's RAM and copies only a small part at a time
into VRAM. It is like reading a big book page by page instead of trying to hold
the whole book open on your desk.

The Soup CLI implements this technique and it is the reason you can fine-tune a
Llama-8B on a 4 GB card.

## And how does it all fit together?

Here is the complete fine-tuning flow, from start to finish, with the terms we
learned:

1. You choose a **base model** (e.g. Llama-3.1-8B) that was already pre-trained
   on billions of texts
2. You prepare a **dataset** with examples of what you want to teach (question
   and answer format)
3. You create a **YAML** file with the settings: which model, which task (**SFT**
   or **DPO**), the **hyperparameters** and the level of **quantization**
4. You apply **LoRA** so only a small part of the model is trained, saving
   memory
5. If the model does not fit in your **VRAM**, you enable **layer streaming**
6. The training runs on your **GPU**, and the result is a small **LoRA** file
   (adapter)
7. You can **merge** the adapter into the base model and **export** to **GGUF**
   to use in Ollama

All of that fits into a single command with tools like Soup. But behind that
command, each of those terms represents an engineering decision that makes
fine-tuning possible on hardware you already have at home.

## A quick summary

| Term | What it is (simply put) |
|---|---|
| **LLM** | An AI model that understands and generates text |
| **Fine-tuning** | Teaching a new skill to an already trained model |
| **LoRA** | A technique that allows fine-tuning using much less memory |
| **VRAM** | The video card's memory, where the model does its work |
| **GPU** | The video card, which does the heavy calculations |
| **Quantization** | Reducing the model's size with little quality loss |
| **Dataset** | The set of examples used for training |
| **SFT** | Fine-tuning with question and correct answer examples |
| **DPO** | Fine-tuning with pairs of good and bad answers |
| **Hyperparameters** | Settings that control how training happens |
| **YAML** | A simple, organized configuration file |
| **GGUF** | File format to use models in tools like Ollama |
| **Layer streaming** | A technique that trains large models on cards with little VRAM |
| **Batch size** | How many examples the model processes at a time |
| **Epoch** | How many times the model sees the complete dataset |

## Conclusion

The world of AI fine-tuning looks full of acronyms and complicated terms, but
each of them solves a specific problem. LoRA exists because VRAM is expensive.
Quantization exists because models are too big. Layer streaming exists because
not everyone has a server GPU.

Understanding these terms is not necessary to use tools like Soup, which
automate almost everything. But it helps you know what is happening when
something goes wrong, or when you need to decide between one configuration and
another.

Start with SFT and a small dataset. After a few fine-tunings, the terms that
seem confusing today will make perfect sense.