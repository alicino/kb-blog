---
title: "Docker for Beginner Developers: Essential Concepts and Commands"
description: "Practical Docker guide covering containers, images, volumes, and networks with real-world examples for beginners."
publishDate: 2026-07-30
author: "Alicino"
category: "Engenharia"
tags: ["docker", "containers", "devops", "tutorial", "infrastructure"]
draft: false
---

Docker changed how developers build, package, and run applications. Instead of installing web servers, databases, and libraries directly on your machine, you define everything in a file and run it in isolated environments called containers. This article explains the fundamental concepts and commands you will use daily.

## What is Docker

Docker is a platform for creating, running, and managing containers. A container is a lightweight package that includes everything an application needs to run: code, runtime, libraries, and configurations. Unlike a virtual machine, a container shares the host operating system's kernel, making it much lighter and faster.

## Containers versus Virtual Machines

| Aspect | Container | Virtual Machine |
|---|---|---|
| **Size** | Megabytes | Gigabytes |
| **Startup** | Seconds | Minutes |
| **Kernel** | Shared with host | Own kernel |
| **Isolation** | Process and filesystem | Virtualized hardware |
| **Portability** | High | Medium |

Containers are ideal for development, testing, and deploying modern applications.

## Fundamental Concepts

### Images

A Docker image is a read-only template that defines what goes inside a container. It contains the base operating system, dependencies, application code, and configurations. Images are built from a Dockerfile.

### Containers

A container is an executable instance of an image. You can start, stop, move, and delete containers. Each container is isolated from others and from the host.

### Dockerfile

A Dockerfile is a text file with instructions for building an image. A simple example for a Node.js application:

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

Volumes let you persist data outside the container's lifecycle. When a container is removed, its internal data disappears. Volumes map host directories into the container.

### Networks

Docker creates virtual networks for communication between containers. By default, containers on the same network can communicate using the container name as hostname.

## Essential Commands

### Managing Images

**List local images:**

```bash
docker images
```

**Pull an image from Docker Hub:**

```bash
docker pull nginx:latest
```

**Remove an image:**

```bash
docker rmi nginx:latest
```

**Build an image from a Dockerfile:**

```bash
docker build -t my-app:1.0 .
```

### Managing Containers

**List running containers:**

```bash
docker ps
```

**List all containers (including stopped):**

```bash
docker ps -a
```

**Run a container:**

```bash
docker run -d -p 8080:80 --name my-nginx nginx:latest
```

Flags explained:
- `-d`: run in background (detached)
- `-p 8080:80`: map host port 8080 to container port 80
- `--name my-nginx`: assign a name to the container

**Stop a container:**

```bash
docker stop my-nginx
```

**Start a stopped container:**

```bash
docker start my-nginx
```

**Remove a container:**

```bash
docker rm my-nginx
```

**View container logs:**

```bash
docker logs -f my-nginx
```

The `-f` flag follows logs in real time.

### Managing Volumes

**Create a volume:**

```bash
docker volume create my-data
```

**Use a volume when running a container:**

```bash
docker run -d -v my-data:/data nginx:latest
```

**List volumes:**

```bash
docker volume ls
```

**Remove a volume:**

```bash
docker volume rm my-data
```

### Docker Compose

Docker Compose lets you define and run multi-container applications. A `docker-compose.yml` file describes all services, networks, and volumes.

Example `docker-compose.yml` for a web application with a database:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:***@db:5432/mydb
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

**Docker Compose commands:**

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose up -d --build
```

## Best Practices

1. **Small images**: Use Alpine base images when possible. They are significantly smaller.

2. **Multi-stage builds**: Separate the application build from the final runtime. This reduces image size and removes unnecessary development dependencies.

3. **Do not run as root**: Create a non-privileged user in the Dockerfile and run the application with it.

4. **Health checks**: Define health checks so Docker knows when your application is actually ready.

5. **.dockerignore**: Create a `.dockerignore` file to exclude unnecessary files from the build context (node_modules, .git, etc.).

## Complete Example: Node.js Application

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

## Conclusion

Docker simplifies application development and deployment by ensuring the development environment is identical to production. With the concepts and commands in this article, you can containerize applications, manage persistent data, and orchestrate multiple services with Docker Compose.

## Sources

1. **Docker Documentation** — Official Docker documentation. https://docs.docker.com/
2. **Docker Hub** — Official Docker image repository. https://hub.docker.com/
3. **Docker Compose Specification** — Docker Compose specification. https://compose-spec.io/
4. **Node.js Docker Best Practices** — Official best practices guide. https://nodejs.org/en/docs/guides/nodejs-docker-webapp