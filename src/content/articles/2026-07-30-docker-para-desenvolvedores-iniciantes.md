---
title: "Docker para Desenvolvedores Iniciantes: Conceitos e Comandos Essenciais"
description: "Guia prático de Docker cobrindo containers, imagens, volumes e redes com exemplos reais para quem está começando."
publishDate: 2026-07-30
author: "Alicino"
category: "Engenharia"
tags: ["docker", "containers", "devops", "tutorial", "infraestrutura"]
draft: false
---

# Docker para Desenvolvedores Iniciantes: Conceitos e Comandos Essenciais

Docker transformou como desenvolvedores constroem, empacotam e executam aplicações. Em vez de instalar servidores web, bancos de dados e bibliotecas diretamente na máquina, você define tudo em um arquivo e executa em ambientes isolados chamados containers. Este artigo explica os conceitos fundamentais e os comandos que você usará no dia a dia.

## O que é Docker

Docker é uma plataforma que permite criar, executar e gerenciar containers. Um container é um pacote leve que inclui tudo o que uma aplicação precisa para funcionar: código, runtime, bibliotecas e configurações. Diferente de uma máquina virtual, um container compartilha o kernel do sistema operacional host, tornando-o muito mais leve e rápido.

## Containers versus Máquinas Virtuais

| Aspecto | Container | Máquina Virtual |
|---------|-----------|-----------------|
| **Tamanho** | Megabytes | Gigabytes |
| **Inicialização** | Segundos | Minutos |
| **Kernel** | Compartilhado com host | Próprio kernel |
| **Isolamento** | Processo e filesystem | Hardware virtualizado |
| **Portabilidade** | Alta | Média |

Containers são ideales para desenvolvimento, testes e deploy de aplicações modernas.

## Conceitos Fundamentais

### Imagens

Uma imagem Docker é um template read-only que define o que vai dentro do container. Ela contém o sistema operacional base, dependências, código da aplicação e configurações. Imagens são construídas a partir de um Dockerfile.

### Containers

Um container é uma instância executável de uma imagem. Você pode iniciar, parar, mover e deletar containers. Cada container é isolado dos outros e do host.

### Dockerfile

O Dockerfile é um arquivo de texto com instruções para construir uma imagem. Um exemplo simples para uma aplicação Node.js:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Volumes

Volumes permitem persistir dados fora do ciclo de vida do container. Quando um container é removido, seus dados internos desaparecem. Volumes mapeiam diretórios do host para dentro do container.

### Redes

Docker cria redes virtuais para comunicação entre containers. Por padrão, containers na mesma rede podem se comunicar usando o nome do container como hostname.

## Comandos Essenciais

### Gerenciar Imagens

**Listar imagens locais:**

```bash
docker images
```

**Baixar uma imagem do Docker Hub:**

```bash
docker pull nginx:latest
```

**Remover uma imagem:**

```bash
docker rmi nginx:latest
```

**Construir uma imagem a partir de Dockerfile:**

```bash
docker build -t minha-app:1.0 .
```

### Gerenciar Containers

**Listar containers em execução:**

```bash
docker ps
```

**Listar todos os containers (incluindo parados):**

```bash
docker ps -a
```

**Executar um container:**

```bash
docker run -d -p 8080:80 --name meu-nginx nginx:latest
```

Os flags significam:
- `-d`: executa em background (detached)
- `-p 8080:80`: mapeia porta 8080 do host para porta 80 do container
- `--name meu-nginx`: define um nome para o container

**Parar um container:**

```bash
docker stop meu-nginx
```

**Iniciar um container parado:**

```bash
docker start meu-nginx
```

**Remover um container:**

```bash
docker rm meu-nginx
```

**Ver logs de um container:**

```bash
docker logs -f meu-nginx
```

O flag `-f` segue os logs em tempo real (follow).

### Gerenciar Volumes

**Criar um volume:**

```bash
docker volume create meus-dados
```

**Usar um volume ao executar container:**

```bash
docker run -d -v meus-dados:/data nginx:latest
```

**Listar volumes:**

```bash
docker volume ls
```

**Remover um volume:**

```bash
docker volume rm meus-dados
```

### Docker Compose

Docker Compose permite definir e executar aplicações multi-container. Um arquivo `docker-compose.yml` descreve todos os serviços, redes e volumes.

Exemplo de `docker-compose.yml` para uma aplicação web com banco de dados:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb

volumes:
  postgres_data:
```

**Comandos do Docker Compose:**

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir imagens
docker-compose up -d --build
```

## Boas Práticas

1. **Imagens pequenas**: Use imagens base Alpine quando possível. Elas são significativamente menores.

2. **Multi-stage builds**: Separe o build da aplicação do runtime final. Isso reduz o tamanho da imagem e elimina dependências de desenvolvimento desnecessárias.

3. **Não execute como root**: Crie um usuário não-privilegiado no Dockerfile e execute a aplicação com ele.

4. **Health checks**: Defina health checks para que o Docker saiba quando sua aplicação está realmente pronta.

5. **.dockerignore**: Crie um arquivo `.dockerignore` para excluir arquivos desnecessários do contexto de build (node_modules, .git, etc.).

## Exemplo Completo: Aplicação Node.js

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "server.js"]
```

**.dockerignore:**

```
node_modules
npm-debug.log
.git
.env
README.md
```

## Conclusão

Docker simplifica o desenvolvimento e deploy de aplicações ao garantir que o ambiente de desenvolvimento seja idêntico ao de produção. Com os comandos e conceitos deste artigo, você já consegue containerizar aplicações, gerenciar dados persistentes e orquestrar múltiplos serviços com Docker Compose.

## Fontes

1. **Docker Documentation** — Documentação oficial do Docker. https://docs.docker.com/
2. **Docker Hub** — Repositório oficial de imagens Docker. https://hub.docker.com/
3. **Docker Compose Specification** — Especificação do Docker Compose. https://compose-spec.io/
4. **Node.js Docker Best Practices** — Guia oficial de boas práticas. https://nodejs.org/en/docs/guides/nodejs-docker-webapp
