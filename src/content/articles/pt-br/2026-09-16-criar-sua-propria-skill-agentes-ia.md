---
title: "Como criar sua própria skill para agentes de IA do zero"
description: "Aprenda a criar skills customizadas para Claude Code e outros agentes de IA. Três exemplos práticos: escrever textos, formatar arquivos e automatizar rotinas."
publishDate: 2026-09-16
author: "Alicino"
category: "Inteligência Artificial"
tags: ["skills", "Claude Code", "agentes", "automação", "SKILL.md", "iniciantes"]
draft: false
---

No artigo anterior sobre o SkillSpector da NVIDIA, eu mostrei que 26% das skills prontas em marketplaces contêm vulnerabilidades. A conclusão mais importante foi esta: sempre que possível, crie sua própria skill.

Criar uma skill não é coisa de outro mundo. É um arquivo de texto com instruções em linguagem natural. Você escreve o que quer que o agente faça, ele lê e executa. Não precisa saber programar. Não precisa de API key. Não precisa de permissão de ninguém.

Este artigo ensina o passo a passo para criar sua primeira skill, com três exemplos práticos que você pode usar hoje mesmo.

## O que é uma skill

Uma skill é um conjunto de instruções que seu agente de IA segue para executar uma tarefa específica. Tecnicamente, é uma pasta com um arquivo `SKILL.md` dentro. O arquivo tem duas partes:

1. **Frontmatter YAML** (entre `---`): diz ao agente o nome da skill, quando usá-la e como invocá-la
2. **Corpo em Markdown**: as instruções que o agente segue quando a skill é ativada

O nome da pasta se torna o comando que você digita. Uma pasta chamada `resumir-texto` com um `SKILL.md` dentro cria o comando `/resumir-texto`. Você digita isso no chat do agente e ele executa as instruções.

## Onde a skill vive

Existem dois lugares para colocar uma skill, e a diferença é importante:

| Escopo | Localização | Vale para |
|---|---|---|
| **Pessoal (global)** | `~/.claude/skills/nome-da-skill/SKILL.md` | Todos os seus projetos |
| **Projeto (local)** | `.claude/skills/nome-da-skill/SKILL.md` | Apenas aquele repositório |

**Skill pessoal:** você cria uma vez e ela está disponível em qualquer projeto que você abrir no Claude Code. Ideal para tarefas do seu dia a dia que não dependem do projeto.

**Skill de projeto:** fica dentro do repositório. Se você commitar, todo time que clonar o repositório terá acesso. Ideal para convenções de equipe, padrões de código e processos do projeto.

## Como criar: passo a passo

Vou usar como exemplo uma skill que escreve textos em português claro e direto, mas o processo é o mesmo para qualquer skill.

### Passo 1: Crie a pasta

Abra o terminal e crie a pasta dentro do diretório de skills pessoais:

```bash
mkdir -p ~/.claude/skills/escrever-texto
```

O nome da pasta (`escrever-texto`) será o comando que você vai digitar: `/escrever-texto`.

### Passo 2: Crie o arquivo SKILL.md

Dentro da pasta, crie o arquivo `SKILL.md`:

```bash
touch ~/.claude/skills/escrever-texto/SKILL.md
```

### Passo 3: Escreva o frontmatter

Abra o arquivo e comece com o frontmatter YAML:

```yaml
---
name: escrever-texto
description: >
  Escreve textos em português claro e direto para artigos de blog,
  documentação técnica e comunicados internos. Usa tom profissional
  mas acessível, frases curtas e estrutura lógica.
---
```

O campo `name` deve ser igual ao nome da pasta. O `description` é o campo mais importante: o agente lê todas as descrições no início da sessão para saber quais skills estão disponíveis. Coloque o caso de uso principal na primeira frase.

### Passo 4: Escreva as instruções

Abaixo do frontmatter, escreva as instruções que o agente vai seguir:

```markdown
Você é um assistente de escrita especializado em criar textos claros e diretos em português brasileiro.

Ao escrever, siga estas regras:

1. Use frases curtas, entre 8 e 25 palavras cada
2. Uma ideia principal por frase
3. Parágrafos de duas a cinco frases relacionadas
4. Tom profissional mas acessível, sem jargão desnecessário
5. Estruture o texto com introdução, desenvolvimento e conclusão
6. Prefira exemplos concretos a explicações abstratas
7. Nunca use travessões ou hífens como pontuação na prosa
8. Use listas numeradas para sequências de passos

Quando o usuário pedir um texto, primeiro pergunte:
- Qual é o público alvo?
- Qual é o objetivo do texto?
- Qual o tamanho esperado?

Depois de entender o contexto, escreva o texto completo.
```

### Passo 5: Teste

No Claude Code, digite `/escrever-texto` e peça para escrever algo. O agente vai ler o frontmatter, carregar as instruções e executar.

Se a skill não aparecer, digite `/doctor` para diagnosticar. Verifique também se o nome da pasta é exatamente o mesmo do campo `name` no frontmatter.

## Exemplo 2: Skill para formatar arquivos e pastas

Esta skill organiza arquivos em um diretório: padroniza nomes, organiza por tipo e gera um resumo do que foi feito.

Crie a pasta:

```bash
mkdir -p ~/.claude/skills/organizar-pasta
```

Crie o `SKILL.md`:

```yaml
---
name: organizar-pasta
description: >
  Organiza arquivos em um diretório: padroniza nomes, agrupa por tipo
  (imagens, documentos, código, dados) e gera relatório das mudanças.
---
```

```markdown
Você é um assistente de organização de arquivos. Quando o usuário pedir para organizar uma pasta, siga este processo:

1. Liste todos os arquivos no diretório informado
2. Classifique cada arquivo por tipo:
   - Imagens: .jpg, .png, .gif, .svg, .webp
   - Documentos: .md, .txt, .pdf, .docx, .xlsx
   - Código: .py, .js, .ts, .html, .css, .json, .yaml, .toml
   - Dados: .csv, .jsonl, .xml
   - Configuração: .env, .gitignore, Dockerfile, Makefile
   - Outros
3. Crie subpastas para cada tipo (se houver mais de 3 arquivos do mesmo tipo)
4. Mova os arquivos para as pastas correspondentes
5. Padronize nomes de arquivo: substitua espaços por hífens, remova caracteres especiais, use letras minúsculas
6. Gere um relatório markdown com:
   - Estrutura final de pastas
   - Quantidade de arquivos por tipo
   - Lista de arquivos renomeados (nome antigo → nome novo)

Importante: antes de mover ou renomear qualquer arquivo, mostre o plano para o usuário e peça confirmação.
```

Para testar: `/organizar-pasta ./downloads`

## Exemplo 3: Skill para rotina de revisão de código

Esta skill padroniza a revisão de código em um time. Ela verifica segurança, estilo, desempenho e boas práticas.

```bash
mkdir -p ~/.claude/skills/revisar-codigo
```

```yaml
---
name: revisar-codigo
description: >
  Revisão estruturada de código: segurança, estilo, desempenho e boas
  práticas. Gera relatório com achados por severidade e recomendações.
---
```

```markdown
Você é um revisor de código sênior. Ao receber um diff ou arquivo para revisão, siga esta estrutura:

1. SEGURANÇA (prioridade máxima)
   - Injeção de SQL ou comandos
   - Vazamento de credenciais ou secrets
   - Validação de input do usuário
   - Autenticação e autorização

2. ESTILO E LEGIBILIDADE
   - Nomes de variáveis e funções claros
   - Complexidade ciclomática (funções muito longas)
   - Comentários necessários e ausentes
   - Consistência com o resto do código

3. DESEMPENHO
   - Loops desnecessários ou ineficientes
   - Consultas N+1 em banco de dados
   - Alocação excessiva de memória
   - Cache ausente onde faria diferença

4. BOAS PRÁTICAS
   - Tratamento de erros adequado
   - Testes unitários para a nova funcionalidade
   - Código morto ou comentado
   - Dependências desnecessárias

Formato do relatório:

## Revisão: [arquivo]

### 🔴 Crítico (deve ser corrigido antes do merge)
- Item 1: explicação e linha

### 🟡 Médio (recomendado corrigir)
- Item 1: explicação e linha

### 🔵 Sugestão (opcional)
- Item 1: explicação e linha

### ✅ Pontos positivos
- Item 1

Sempre inclua pelo menos um ponto positivo. Revisão não é só para criticar.
```

Para testar: `/revisar-codigo src/app.py` ou `/revisar-codigo` (no diff atual)

## Dicas para criar skills melhores

**A descrição é o campo mais importante.** O agente lê todas as descrições no início da sessão para decidir quais skills carregar automaticamente. Coloque o caso de uso principal na primeira frase. Se a descrição for muito vaga, o agente nunca vai usar a skill.

**Use `disable-model-invocation: true` para ações destrutivas.** Se a skill faz algo irreversível (deploy, exclusão, alteração de produção), adicione este campo no frontmatter para que apenas você possa invocá-la manualmente:

```yaml
---
name: fazer-deploy
description: "Faz deploy para produção"
disable-model-invocation: true
---
```

**Skills com scripts são mais poderosas.** Você pode incluir scripts Python ou shell na pasta da skill e referenciá-los no `SKILL.md` usando a variável `${CLAUDE_SKILL_DIR}`:

```markdown
Execute o script de validação antes de prosseguir:
```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/validar.py
```
```

**Teste com `/doctor`.** Se uma skill não aparece, digite `/doctor` no Claude Code. Ele mostra quais skills estão carregadas e se alguma foi truncada por limite de caracteres.

**Skills são portáteis.** O mesmo arquivo `SKILL.md` funciona em Claude Code, Codex CLI, Gemini CLI e Cursor. Só muda o diretório de instalação.

## O que fazer depois de criar sua primeira skill

Depois que você criar uma skill e sentir como funciona, o próximo passo natural é:

1. **Criar skills para tarefas que você repete toda semana.** Code review, deploy, organização de arquivos, formatação de commits, geração de changelog. Tudo que você faz mais de uma vez vira skill.

2. **Compartilhar skills com seu time.** Coloque no diretório `.claude/skills/` dentro do repositório do projeto. Quando você commitar, todo mundo que clonar terá acesso.

3. **Adicionar scripts.** Uma skill que só lê instruções é útil. Uma skill que executa um script Python para validar dados antes de um deploy é muito mais útil.

4. **Usar o SkillSpector.** Mesmo nas suas próprias skills, passar pelo scanner da NVIDIA é uma boa prática para garantir que não há nada inesperado.

## Links úteis

- [Documentação oficial do Claude Code sobre skills](https://code.claude.com/docs/pt/skills)
- [Guia de criação de skills (Claude Help Center)](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Repositório de exemplo: skills.sh (skills comunitárias)](https://github.com/skills-sh/skills.sh)
- [SkillSpector: scanner de segurança para skills](https://github.com/NVIDIA/SkillSpector)
- [Tutorial: Criar skill no Claude Code passo a passo (Hora de Codar)](https://horadecodar.com.br/criar-skill-claude-code/)
- [Tutorial: Building custom skills (Blake Crosby)](https://blakecrosley.com/pt-BR/blog/building-custom-skills)
- [Guia: How to Build Custom Claude Code Skills (DEV Community)](https://dev.to/alanwest/how-to-build-custom-claude-code-skills-that-actually-work-2e1f)

## Conclusão

Criar sua própria skill é o passo mais importante que você pode dar para usar agentes de IA com segurança e produtividade. Você não depende de código de terceiros. Você não expõe seus dados a marketplaces não verificados. Você cria exatamente o que precisa.

O formato é simples: uma pasta, um arquivo, instruções em linguagem natural. Se você sabe escrever um README, você sabe criar uma skill. E depois que você cria a primeira, a segunda sai em cinco minutos.

Comece com uma tarefa pequena que você repete toda semana. Transforme em skill. E na semana seguinte, aquela tarefa não vai mais tomar seu tempo.