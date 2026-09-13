---
title: Guia de Workflow - Criação de Artigos para KB Blog
description: Próximos passos após escrever um artigo - estructura de arquivos, Git workflow, e aprovação via PR
---

# Guia de Workflow - Criação de Artigos para KB Blog

Este documento descreve os próximos passos **após escrever um artigo**: onde colocar, como gerenciar git, e como criar um PR eficiente para aprovação.

## 1. Escrever em Ambos os Idiomas

Todo novo artigo deve ser criado **simultaneamente em português E inglês**.

**Nunca:**
- Escrever só em português e traduzir depois
- Fazer commits separados para cada idioma
- Criar PRs diferentes por idioma

**Sempre:**
- Escrever o artigo em português primeiro
- Criar a versão em inglês (tradução ou reescrita)
- Fazer commit de ambas no mesmo commit

### ⚠️ OBRIGATÓRIO: Dois Arquivos, Um Commit

Cada novo artigo resulta em **exatamente dois arquivos**:

```
📁 Pasta PT-BR (Português Brasil)
   src/content/articles/pt-br/YYYY-MM-DD-slug.md

📁 Pasta EN (Inglês)
   src/content/articles/en/YYYY-MM-DD-slug.md
```

**Não é opcional. Sempre dois arquivos.**

## 2. Estrutura de Diretórios

### Local correto para cada artigo:

**Português (Brasil):**
```
src/content/articles/pt-br/YYYY-MM-DD-slug-do-artigo.md
```

**Inglês:**
```
src/content/articles/en/YYYY-MM-DD-slug-do-artigo.md
```

**Regras importantes:**
- Use a **mesma data** em ambos os arquivos
- Use o **mesmo slug** em ambos
- O slug deve ser em inglês (mesmo o artigo português)
- Formato de data: `2026-09-13` (YYYY-MM-DD)

### Exemplo:
```
src/content/articles/pt-br/2026-09-13-como-usar-docker.md
src/content/articles/en/2026-09-13-how-to-use-docker.md
```

## 3. Frontmatter - Conteúdo Obrigatório

Ambas as versões precisam de:

```yaml
---
title: "Título do Artigo"
description: "Uma linha descrevendo o artigo"
publishDate: 2026-09-13
author: "Alicino"
category: "Categoria"
tags: ["tag1", "tag2", "tag3"]
draft: false
---
```

**Notas:**
- `title`: Traduzido para cada idioma
- `description`: Traduzida para cada idioma
- `publishDate`: Mesma data em ambas
- `category`: Pode estar em português (será exibida localmente)
- `tags`: Em inglês (facilita buscas)
- `draft: false` para publicar imediatamente

## 3.5 Exemplo Prático Completo

**Cenário:** Criar artigo sobre Docker

```
📊 ESTRUTURA FINAL:

Título: Docker Complete Guide
Data: 2026-09-13
Slug: docker-complete-guide

├─ 📁 src/content/articles/pt-br/
│  └─ 2026-09-13-docker-complete-guide.md ← Versão português
│     ---
│     title: "Docker: Guia Completo"
│     description: "Aprenda Docker do zero"
│     publishDate: 2026-09-13
│     ...
│
├─ 📁 src/content/articles/en/
│  └─ 2026-09-13-docker-complete-guide.md ← Versão inglês
│     ---
│     title: "Docker: Complete Guide"
│     description: "Learn Docker from scratch"
│     publishDate: 2026-09-13
│     ...
```

**O que fazer:**
1. ✓ Escrever artigo em português completo
2. ✓ Criar arquivo em `pt-br/2026-09-13-docker-complete-guide.md`
3. ✓ Escrever versão em inglês completa
4. ✓ Criar arquivo em `en/2026-09-13-docker-complete-guide.md`
5. ✓ **Ambos os arquivos em um único commit**
6. ✓ **Um único PR contendo os dois**

**O que NÃO fazer:**
- ✗ Escrever só português e pedir para traduzir depois
- ✗ Fazer dois commits (um por idioma)
- ✗ Fazer dois PRs (um por idioma)
- ✗ Deixar um idioma "para depois"

---

## 4. Git Workflow - Passo a Passo

### 4.1 Criar uma branch

```bash
git checkout -b artigo/YYYY-MM-DD-slug
```

Exemplo:
```bash
git checkout -b artigo/2026-09-13-docker-guide
```

### 4.2 Criar os arquivos

Coloque os dois arquivos (.md em português e em inglês) nas pastas corretas.

### 4.3 Verificar status

```bash
git status
```

Você deve ver:
```
Untracked files:
  src/content/articles/pt-br/2026-09-13-docker-guide.md
  src/content/articles/en/2026-09-13-docker-guide.md
```

### 4.4 Fazer o commit

```bash
git add src/content/articles/pt-br/2026-09-13-docker-guide.md
git add src/content/articles/en/2026-09-13-docker-guide.md
git commit -m "Add article: Docker Guide (PT-BR + EN)"
```

**Formato da mensagem:**
```
Add article: [Título do Artigo] (PT-BR + EN)
```

Ou se for atualizar um artigo existente:
```
Update article: [Título do Artigo] (PT-BR + EN)
```

### 4.5 Push para remote

```bash
git push origin artigo/2026-09-13-docker-guide
```

## 5. Criar o Pull Request

Após fazer push, crie um PR no GitHub com:

### Título do PR:
```
[Article] Docker Guide (PT-BR + EN) - 2026-09-13
```

### Descrição do PR:

```markdown
## Article Submission

**Título PT-BR**: Como Usar Docker
**Título EN**: How to Use Docker

**Data**: 2026-09-13
**Categoria**: Ferramentas
**Tags**: docker, containers, devops

### Checklist
- [x] Artigo em português criado
- [x] Artigo em inglês criado
- [x] Frontmatter completo em ambas as versões
- [x] Slug e data idênticos
- [x] Sem typos ou formatação quebrada
- [x] Links testados
- [x] Código testado (se aplicável)

### Resumo do conteúdo
[Breve descrição do que o artigo cobre]

### Notas para aprovação
[Qualquer contexto específico que Alicino deve saber]
```

## 6. Verificações Antes do PR

Execute os testes locais antes de fazer push:

### 6.1 Build do projeto
```bash
npm run build
```

**O que verificar:**
- Nenhum erro de sintaxe markdown
- Frontmatter válido
- Links internos corretos

### 6.2 Preview local (opcional)
```bash
npm run dev
```

Acesse `http://localhost:3000` e navegue até o artigo para verificar:
- Layout correto
- Imagens carregam
- Links funcionam
- Formatação visível

### 6.3 Verificação de conteúdo
- [ ] Título é claro e descritivo
- [ ] Descrição tem menos de 160 caracteres
- [ ] Tags relevantes (3-6 tags)
- [ ] Data está correta
- [ ] Slug em inglês mesmo em PT-BR
- [ ] Sem duplicação com artigos existentes

## 7. Administração do PR - Workflow de Aprovação

### Estado 1: Draft
Artigo está sendo revisado internamente, ainda não pronto para PR.

**Ação**: Salve em uma branch, não crie PR ainda.

### Estado 2: Open
PR foi criado e está esperando revisão do Alicino.

**O que o Alicino verificará:**
- Conteúdo tecnicamente correto
- Posição adequada no blog
- Qualidade geral da escrita
- Alinhamento com outros artigos

### Estado 3: Changes Requested
Alicino solicitou mudanças.

**Ações possíveis:**
1. Corrija o artigo localmente
2. Faça um novo commit na mesma branch
3. Push novamente
4. PR será automaticamente atualizado

Exemplo:
```bash
# Editar o arquivo
nano src/content/articles/pt-br/2026-09-13-docker-guide.md

# Fazer commit adicional
git add src/content/articles/pt-br/2026-09-13-docker-guide.md
git commit -m "Fix: typos and clarification in Docker Guide"

# Push (mesma branch)
git push origin artigo/2026-09-13-docker-guide
```

### Estado 4: Approved
Alicino aprovou o artigo.

**Próximos passos:**
1. Merge para `main`
2. Deploy automático (se houver CI/CD)
3. Artigo apareça no blog

## 8. Checklist de Submissão Completo

Antes de fazer qualquer push:

- [ ] Ambos os arquivos (.pt-br e .en) criados
- [ ] Mesma data em ambos (YYYY-MM-DD)
- [ ] Mesmo slug em ambos (em inglês)
- [ ] Frontmatter completo e válido
- [ ] `draft: false` em ambos
- [ ] Build local passou (`npm run build`)
- [ ] Branch nomeada com `artigo/YYYY-MM-DD-slug`
- [ ] Commit com mensagem clara
- [ ] PR criado com template completo
- [ ] Descrição do PR tem contexto para aprovação

## 9. Pós-Aprovação

Após merge para `main`:

### Verificações finais
1. Build em produção passou
2. Artigo visível em ambos os idiomas
3. URLs estão corretas
4. Links internos funcionam

### Atualizar tracking
Se houver um Trello/Issue/Project:
- Mova para "Done"
- Adicione link ao PR
- Registre data de publicação

## 10. FAQs de Workflow

**P: E se precisar atualizar um artigo existente?**
R: Use a mesma branch, faça novo commit, push novamente. O PR será atualizado.

**P: Posso fazer múltiplos artigos no mesmo PR?**
R: Não. Um PR = um artigo. Mantém controle e rastreabilidade.

**P: E se a data de publicação mudar?**
R: Renomeie os arquivos e o commit com a nova data. Exemplo:
```bash
git mv src/content/articles/pt-br/2026-09-13-docker-guide.md \
       src/content/articles/pt-br/2026-09-14-docker-guide.md
```

**P: Qual é o tempo esperado de aprovação?**
R: Geralmente em 24-48 horas. Alicino faz review e fornece feedback.

**P: Posso editar o artigo após merge?**
R: Sim, via novo PR. Crie uma branch separada: `artigo/2026-09-13-docker-guide-update`

---

**Versão**: 1.0
**Última atualização**: Setembro 2026
