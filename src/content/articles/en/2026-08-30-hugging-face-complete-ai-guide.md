---
title: "Hugging Face: Complete AI Guide for Everyone"
description: "Learn Hugging Face ecosystem: using pre-trained models, fine-tuning, deploying, and building AI applications. From beginner to production."
publishDate: 2026-08-30
author: "Alicino"
category: "Inteligência Artificial"
tags: ["hugging-face", "transformers", "NLP", "models", "fine-tuning", "AI"]
draft: false
---

Hugging Face is the GitHub of AI models. It's the largest repository of pre-trained machine learning models, and it's democratized AI in a way that few platforms have managed.

Five years ago, fine-tuning a language model required a PhD in machine learning, about $100,000 worth of GPU servers, and months of experimentation. Today, with Hugging Face, you can fine-tune a state-of-the-art model with a single Python script and run it on a $500 GPU.

Hugging Face is actually three things working together. First, there's the model hub with over 500,000 pre-trained models covering transformers, diffusion models, large language models, speech, and vision. Second, there are the open source libraries: transformers, datasets, diffusers, and accelerate. Third, there are inference services so you can deploy models without managing servers yourself.

### The ecosystem

```
┌─────────────────────────────────┐
│   Hugging Face Hub              │
│  (500k+ community models)        │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
Libraries          Services
├─ transformers    ├─ Inference API
├─ datasets        ├─ Spaces
├─ diffusers       └─ AutoTrain
└─ accelerate
```

## Installation

```bash
# Core library
pip install transformers

# With PyTorch (recommended)
pip install transformers torch

# With TensorFlow
pip install transformers tensorflow

# Plus tools
pip install datasets accelerate
```

## Your first model: Text generation

### Step 1: Load a model

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load Mistral (7B, fast and capable)
model_name = "mistralai/Mistral-7B-Instruct-v0.2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
```

### Step 2: Generate text

```python
prompt = "What is machine learning?"

# Tokenize
inputs = tokenizer(prompt, return_tensors="pt")

# Generate
outputs = model.generate(
    **inputs,
    max_length=100,
    temperature=0.7,
    top_p=0.9
)

# Decode
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)
```

Output:
```
What is machine learning? Machine learning is a type of artificial 
intelligence that learns from data without being explicitly programmed. 
It uses algorithms to find patterns in data and make predictions...
```

## Common models and their uses

Mistral is a 7B model that's fast and good for general purpose chat. Llama 2 comes in sizes from 7B to 70B and is great for instruction following. GPT-2 is small at 124M and very fast, good for learning. BERT is 110M and specialized for text classification. Flan-T5 ranges from 250M to 11B and handles summarization and question answering well. Stable Diffusion is 3.5B and is for image generation.

If you need speed, use small models between 110M and 3B parameters. If you need quality, go for medium models around 7B to 13B. If you want both, use large models at 70B or more, but you'll need powerful hardware.

## Text classification

Classify sentiment, topic, intent:

```python
from transformers import pipeline

# Load classification pipeline
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

text = "I absolutely love this product! It changed my life."

labels = ["positive", "negative", "neutral"]
result = classifier(text, labels)

print(result)
# {'sequence': 'I absolutely love this product!...', 
#  'labels': ['positive', 'negative', 'neutral'],
#  'scores': [0.98, 0.01, 0.01]}
```

## Named entity recognition (NER)

Extract entities (people, places, organizations):

```python
from transformers import pipeline

ner = pipeline("ner", model="dbmdz/bert-base-multilingual-cased")

text = "Steve Jobs founded Apple in 1976 in Los Altos."

entities = ner(text)
for entity in entities:
    print(f"{entity['word']}: {entity['entity']}")

# Output:
# Steve Jobs: B-PER
# Apple: I-ORG
# Los Altos: I-LOC
# 1976: B-DATE
```

## Question answering

```python
from transformers import pipeline

qa = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

context = """
Machine learning is a field of AI. It learns from data.
Deep learning uses neural networks with multiple layers.
"""

question = "What is machine learning?"

answer = qa(question=question, context=context)
print(answer['answer'])
# Output: "a field of AI"
```

## Fine-tuning: Training on your data

### Step 1: Prepare your data

```python
from datasets import load_dataset

# Load your data
dataset = load_dataset("csv", data_files="my_data.csv")

# Split into train/validation
train_data = dataset["train"].train_test_split(test_size=0.1)
```

Your CSV:
```
text,label
"I love this product",1
"Waste of money",0
```

### Step 2: Tokenize

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        padding="max_length",
        max_length=128,
        truncation=True
    )

tokenized_datasets = dataset.map(tokenize_function, batched=True)
```

### Step 3: Train

```python
from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments

model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)

training_args = TrainingArguments(
    output_dir="./my_model",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    learning_rate=2e-5,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
)

trainer.train()
```

### Step 4: Evaluate

```python
metrics = trainer.evaluate()
print(metrics)
# {'eval_loss': 0.15, 'eval_accuracy': 0.94}
```

## Deploying your model

### Option 1: Hugging Face Inference API (fastest)

```python
from huggingface_hub import InferenceClient

client = InferenceClient(api_key="hf_your_api_key")

response = client.text_generation(
    model="mistralai/Mistral-7B-Instruct-v0.2",
    prompt="Explain quantum computing"
)

print(response)
```

### Option 2: Hugging Face Spaces (free hosting)

Create a Streamlit/Gradio app:

```python
# app.py
import gradio as gr
from transformers import pipeline

classifier = pipeline("sentiment-analysis")

def classify_text(text):
    result = classifier(text)[0]
    return f"{result['label']}: {result['score']:.2%}"

gr.Interface(
    fn=classify_text,
    inputs="text",
    outputs="text",
    title="Sentiment Classifier"
).launch()
```

Push to Hugging Face Spaces:

```bash
git clone https://huggingface.co/spaces/your-username/my-app
cd my-app
git add app.py requirements.txt
git commit -m "Add sentiment classifier"
git push
```

### Option 3: Self-hosted (Docker)

```bash
docker pull huggingface/text-generation-inference:latest

docker run \
  -p 8080:80 \
  -e MODEL_ID=mistralai/Mistral-7B-Instruct-v0.2 \
  -e CUDA_VISIBLE_DEVICES=0 \
  ghcr.io/huggingface/text-generation-inference:latest
```

Test:

```bash
curl http://localhost:8080/generate \
  -X POST \
  -d '{"inputs":"Hello, "}' \
  -H 'Content-Type: application/json'
```

## Working with datasets

### Load public datasets

```python
from datasets import load_dataset

# Common datasets
wmt = load_dataset("wmt14", "en-fr")  # Translation
squad = load_dataset("squad")          # QA
imdb = load_dataset("imdb")            # Sentiment

# Explore
print(wmt["train"][0])
print(len(squad["validation"]))
```

### Create your own dataset

```python
from datasets import Dataset

data = {
    "text": ["Example 1", "Example 2"],
    "label": [1, 0]
}

dataset = Dataset.from_dict(data)
dataset.push_to_hub("username/my-dataset")
```

## Advanced: LoRA fine-tuning

Fine-tune large models efficiently:

```python
from peft import get_peft_model, LoraConfig, TaskType
from transformers import AutoModelForCausalLM

# Load model
model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")

# Add LoRA
peft_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"]
)

model = get_peft_model(model, peft_config)

# Train (same as before)
trainer.train()

# Save
model.save_pretrained("my-lora-model")
```

## Best practices

Start with pretrained models. Never train from scratch. Transfer learning is faster and produces better results.

Use smaller models for testing. DistilBERT is 40% smaller and 60% faster than BERT. Flan-T5 small is plenty for testing before you move to the large version.

Watch your hardware. Use nvidia-smi to see what your GPU is actually doing. If you run out of memory, reduce your batch size.

Validate regularly during training. Evaluate against your validation set throughout the process and use early stopping to avoid overfitting.

Share what you build. Push your models to the Hugging Face Hub. Write a good model card with details about your training. This helps reproducibility and lets others build on your work.

## Useful links

The Hugging Face Hub at huggingface.co/models has all the models. The documentation is at huggingface.co/docs. Datasets are at huggingface.co/datasets. Spaces for hosting apps are at huggingface.co/spaces. And there's a free course at huggingface.co/course.

## Conclusion

Hugging Face has made AI accessible. You don't need a PhD or a supercomputer to work with state-of-the-art models anymore.

Start with a simple fine-tuning example. Build from there. Share what you learn. That's how the AI future becomes collaborative.
