---
title: "AI Fine-Tuning for Beginners: a glossary of every term you will come across"
description: "A complete glossary of fine-tuning terms explained for beginners: LLM, LoRA, VRAM, GPU, quantization, dataset, SFT, DPO, hyperparameters, YAML, GGUF, and layer streaming."
publishDate: 2026-09-12
author: "Alicino"
category: "Inteligência Artificial"
tags: ["fine-tuning", "LLM", "LoRA", "glossary", "beginners", "machine learning", "AI"]
draft: false
---

If you have been following the world of AI lately, you have probably heard terms like fine-tuning, LoRA, quantization, and SFT. They sound technical, and they are. But understanding them is not as hard as it seems.

This glossary explains each term in plain language, with examples and context, so you can follow conversations about AI training without feeling lost.

## A

### Alignment
The process of making an AI model behave according to human values and intentions. An aligned model refuses harmful requests, avoids bias, and follows instructions as intended. Techniques like RLHF (Reinforcement Learning from Human Feedback) and DPO are alignment methods.

### Architecture
The structural design of a neural network. Different architectures (Transformer, Mixture of Experts, State Space Models) process information in different ways. The Transformer architecture is the basis for most modern LLMs.

## B

### Backpropagation
The algorithm that trains neural networks. It calculates how much each parameter contributed to the error and adjusts them to reduce it. Backpropagation is what makes learning possible, but it requires storing intermediate values in memory, which is why VRAM usage is high during training.

### Base model
An untrained or pre-trained model before fine-tuning. It has learned general patterns from large amounts of data but has not been adapted to a specific task. Examples: Llama-3.1-8B, Mistral-7B, Qwen2.5-3B.

### Batch size
The number of samples processed together before the model updates its parameters. A larger batch size means more stable training but requires more VRAM. A smaller batch size fits in less memory but can make training noisier.

### Benchmark
A standardized test used to compare model performance. Examples: MMLU (knowledge), GSM8K (math), HumanEval (code), MT-Bench (conversation). Benchmarks help you choose between models, but they do not measure everything that matters.

### BF16 (Brain Float 16)
A 16-bit floating point format used in modern GPUs. It offers better numerical stability than FP16 while using less memory than FP32. Most fine-tuning today uses BF16 by default.

## C

### Checkpoint
A saved copy of the model's weights at a specific point during training. Checkpoints let you resume training if something fails, or go back to an earlier version if the model starts to degrade.

### Cold start
Starting a model from scratch with random weights. This requires enormous amounts of data and compute. Almost nobody does cold start training anymore. Instead, you start from a pre-trained model and fine-tune.

### Continuous batching
A technique where the inference server groups requests as they arrive, rather than waiting for a full batch. This increases throughput and reduces latency. Used by TGI, vLLM, and TensorRT-LLM.

### Convergence
The point during training where the model stops improving significantly. The loss curve flattens. Training past convergence can lead to overfitting.

## D

### Dataset
The collection of examples used to train or fine-tune a model. For supervised fine-tuning, each example has an input (instruction) and an expected output (response). Dataset quality matters more than dataset size.

### DPO (Direct Preference Optimization)
A training method that aligns a model using pairs of preferred and rejected responses, without needing a separate reward model. It is simpler than RLHF and has become popular in 2025-2026 for preference alignment.

### Dropout
A regularization technique that randomly ignores a fraction of neurons during training. This prevents the model from becoming too dependent on specific neurons and helps generalization.

## E

### Embedding
A numerical representation of text (or images, audio) as a vector of floating point numbers. Embeddings capture semantic meaning: similar texts have similar vectors. They are used for search, classification, and as input to neural networks.

### Epoch
One complete pass through the entire training dataset. If you train for 3 epochs, the model sees each example three times. More epochs can improve performance but increase the risk of overfitting.

## F

### Fine-tuning
The process of taking a pre-trained model and continuing its training on a smaller, task-specific dataset. Instead of training a model from scratch (which costs millions of dollars), you adapt an existing model for your use case. Fine-tuning changes the model's weights to make it better at your specific task.

### Forward pass
When data flows through the neural network from input to output, generating a prediction. The forward pass produces the loss, which measures how wrong the prediction was.

### FP16 (16-bit Floating Point)
A half-precision floating point format. Uses half the memory of FP32 but can suffer from numerical instability during training. BF16 is generally preferred.

### FP32 (32-bit Floating Point)
Full precision floating point. Used as the reference for numerical accuracy. Training in FP32 is stable but requires twice the memory of BF16 or FP16.

## G

### GGUF
A file format for storing quantized models, created by the llama.cpp project. GGUF files contain the model weights in a compact format that runs efficiently on consumer hardware. Models in GGUF format are what you download to run locally with tools like Ollama or llama.cpp.

### GPTQ (GPT Post-Training Quantization)
A quantization technique that compresses model weights to 4 or 3 bits. GPTQ models run faster than FP16 versions on GPUs with minimal quality loss. Common in text generation inference.

### GPU (Graphics Processing Unit)
The specialized hardware that trains and runs neural networks. GPUs are designed for parallel computation, which is exactly what neural networks need. Key specifications for AI work: VRAM amount, memory bandwidth, and compute capability.

### Gradient
The mathematical value that tells the optimizer how much to adjust each parameter during training. Gradients are calculated during backpropagation and represent the direction and magnitude of change needed.

### Gradient accumulation
A technique that simulates a larger batch size by accumulating gradients over several smaller batches before updating the model. Useful when your GPU does not have enough VRAM for the desired batch size.

### Gradient checkpointing
A memory-saving technique that discards intermediate activations during the forward pass and recomputes them during backpropagation. This reduces VRAM usage by 30-50% at the cost of slower training.

## H

### Hallucination
When a model generates false information that sounds plausible. The model is not lying intentionally: it is generating text that statistically matches the patterns it learned, even when those patterns do not correspond to reality.

### Hyperparameters
Configuration values that control how training happens, set before training begins. Examples: learning rate, batch size, number of epochs, LoRA rank. Hyperparameters are not learned by the model; you choose them based on experimentation.

## I

### Inference
Using a trained model to generate predictions. When you chat with an LLM, you are running inference. Inference requires less memory than training because you do not need to store gradients or optimizer states.

### Instruction tuning
Fine-tuning a model on a dataset of instructions and expected responses. This is what turns a base model into a useful assistant. The model learns to follow instructions rather than just complete text.

## L

### Layer streaming
A technique that keeps the frozen base model in system RAM and copies only one decoder layer at a time to VRAM during training. This allows fine-tuning models that would not fit entirely in VRAM. Used by NVIDIA's SkillSpector's sibling tool, Soup CLI.

### Learning rate
A hyperparameter that controls how much the model's parameters are adjusted in each training step. Too high: training diverges. Too low: training takes forever or gets stuck. Typical values range from 1e-4 to 5e-5 for fine-tuning.

### LLM (Large Language Model)
A neural network trained on massive amounts of text to understand and generate human language. Examples: GPT-4, Llama 3, Mistral, Qwen, Gemma. LLMs are measured by the number of parameters (7 billion, 70 billion, etc.) and the amount of data they were trained on.

### LoRA (Low-Rank Adaptation)
A fine-tuning technique that adds small, trainable matrices to the existing model instead of updating all parameters. LoRA reduces the number of trainable parameters by 99% or more, making fine-tuning possible on consumer GPUs. A LoRA adapter is typically a few megabytes, compared to gigabytes for the full model.

### Loss
A numerical value that measures how wrong the model's predictions are. Lower loss means better predictions. The loss decreases during training as the model learns.

## M

### Model
A neural network with its learned parameters (weights). In the context of AI, "model" usually refers to a complete system that can generate text, answer questions, or perform other tasks. Examples: Llama-3.1-8B, GPT-4o, Claude 4.

### Multi-modal
A model that can process multiple types of data: text, images, audio, and video. Examples: GPT-4o (text + images + audio), Gemini (text + images + audio + video), Llama 4 (text + images).

## N

### NF4 (NormalFloat4)
A 4-bit quantization format that preserves more accuracy than standard 4-bit quantization. NF4 is used by the Soup CLI's layer streaming to reduce model storage by approximately 4x.

### NPU (Neural Processing Unit)
Specialized hardware designed specifically for neural network inference. Found in modern smartphones (Apple Neural Engine, Qualcomm AI Engine) and some laptops (Intel NPU). More efficient than GPUs for inference but less flexible.

## O

### Overfitting
When a model memorizes the training data instead of learning general patterns. An overfitted model performs well on training data but poorly on new, unseen data. Symptoms: training loss keeps decreasing but validation loss starts increasing.

### Optimizer
The algorithm that updates model parameters based on gradients. Adam and AdamW are the most common optimizers for LLM training. The optimizer maintains state (like momentum) that also consumes VRAM.

## P

### Parameter
A numerical value inside the neural network that is learned during training. In LLMs, parameters are the weights of the connections between neurons. Model size is measured in parameters: a 7B model has 7 billion parameters.

### Pre-training
The initial phase of training where a model learns general language patterns from massive datasets (often terabytes of text). Pre-training costs millions of dollars in compute. The result is a base model that understands language but has not been adapted to specific tasks.

### PEFT (Parameter-Efficient Fine-Tuning)
A family of techniques that fine-tune models by updating only a small fraction of parameters. LoRA and QLoRA are PEFT methods. PEFT makes fine-tuning accessible on consumer hardware.

## Q

### QLoRA (Quantized LoRA)
A combination of quantization and LoRA. The base model is loaded in 4-bit (quantized), reducing memory usage by 4x, while LoRA adapters are trained in full precision. This allows fine-tuning a 70B model on a single 48 GB GPU.

### Quantization
A technique that reduces the precision of model weights, trading some accuracy for lower memory usage and faster inference. A model stored in 4-bit uses 4x less memory than the same model in 16-bit. Common formats: NF4, GPTQ, AWQ, GGUF Q4_K_M.

## R

### RAG (Retrieval-Augmented Generation)
A technique that combines a model with an external knowledge base. When asked a question, the system first searches the knowledge base for relevant information and then feeds that information to the model as context. RAG does not require fine-tuning.

### RLHF (Reinforcement Learning from Human Feedback)
A three-stage alignment process: supervised fine-tuning, reward model training, and reinforcement learning optimization. RLHF is what made ChatGPT behave like a helpful assistant. DPO is a simpler alternative that achieves similar results.

### Rope (Rotary Position Embedding)
A technique used in modern LLMs (Llama, Mistral, Qwen) to encode the position of tokens in a sequence. It allows the model to understand word order and relative distances between words.

## S

### SFT (Supervised Fine-Tuning)
The simplest form of fine-tuning: training a model on pairs of inputs and expected outputs using supervised learning. You show the model examples of good responses, and it learns to reproduce them. SFT is the first step in most training pipelines.

### Sharding
Splitting a model across multiple GPUs or machines. Each GPU holds a portion of the model parameters. Techniques: tensor parallelism (splitting individual layers) and pipeline parallelism (splitting layers across devices).

### Slop
Low-quality, repetitive, or overly generic content generated by AI models. Slop is not technically incorrect, but it adds no value. Reducing slop is one reason to fine-tune a model for your specific use case.

## T

### Temperature
A hyperparameter that controls the randomness of model outputs. Low temperature (0.1): more deterministic, repetitive. High temperature (0.8): more creative, varied. For factual tasks, use low temperature. For creative writing, use higher temperature.

### Tensor
A multi-dimensional array of numbers. In deep learning, everything is a tensor: inputs, outputs, weights, gradients. Tensors flow through the neural network during forward and backward passes.

### Token
The basic unit of text that a language model processes. A token is not a word. It can be a word fragment, a whole word, or a punctuation mark. For example, "unbelievable" might be split into ["un", "believe", "able"]. An average English word is about 1.3 tokens.

### Tokenizer
The component that converts text into tokens (for input) and tokens back into text (for output). Different models use different tokenizers. Llama uses a BPE tokenizer with a 128K vocabulary. Qwen uses a tokenizer optimized for multilingual text.

### Training
The process of adjusting model parameters to minimize the loss function. Training requires: a dataset, a model architecture, a loss function, an optimizer, and hardware (GPU) to run the computations.

## V

### Validation
Evaluating the model on data it has not seen during training. Validation loss tells you if the model is overfitting. Always split your dataset into training and validation sets.

### VRAM (Video RAM)
The memory on a graphics card. VRAM is the most critical resource for training and running LLMs. Model weights, gradients, optimizer states, and activations all need to fit in VRAM. A 7B model in 16-bit needs about 14 GB of VRAM just for the weights.

## Y

### YAML
A human-readable data format used for configuration files. In tools like Soup CLI, you define the model, dataset, hyperparameters, and training method in a YAML file. YAML uses indentation for structure, similar to Python.

## Z

### Zero-shot
The ability of a model to perform a task without any specific training examples. For example, asking a model to translate English to French without ever showing it translation pairs. Fine-tuning improves performance on tasks where zero-shot is not good enough.