---
title: "How to create your own AI agent skill from scratch"
description: "Learn how to create custom skills for Claude Code and other AI agents. Three practical examples: writing text, organizing files, and automating code review routines."
publishDate: 2026-09-16
author: "Alicino"
category: "Inteligência Artificial"
tags: ["skills", "Claude Code", "agents", "automation", "SKILL.md", "beginners"]
draft: false
---

In the previous article about NVIDIA's SkillSpector, I showed that 26% of pre-built skills in marketplaces contain vulnerabilities. The most important conclusion was this: whenever possible, create your own skill.

Creating a skill is not complicated. It is a text file with instructions in natural language. You write what you want the agent to do, it reads and executes. No programming required. No API key needed. No permission from anyone.

This article walks through the step-by-step process of creating your first skill, with three practical examples you can use today.

## What is a skill

A skill is a set of instructions that your AI agent follows to perform a specific task. Technically, it is a folder with a `SKILL.md` file inside. The file has two parts:

1. **YAML frontmatter** (between `---`): tells the agent the skill's name, when to use it, and how to invoke it
2. **Markdown body**: the instructions the agent follows when the skill is activated

The folder name becomes the command you type. A folder named `write-text` with a `SKILL.md` inside creates the `/write-text` command. You type it in the agent's chat and it executes the instructions.

## Where skills live

There are two places to put a skill, and the difference matters:

| Scope | Location | Applies to |
|---|---|---|
| **Personal (global)** | `~/.claude/skills/skill-name/SKILL.md` | All your projects |
| **Project (local)** | `.claude/skills/skill-name/SKILL.md` | That repository only |

**Personal skill:** you create it once and it is available in every project you open in Claude Code. Ideal for daily tasks that do not depend on the project.

**Project skill:** lives inside the repository. If you commit it, every team member who clones the repo will have access. Ideal for team conventions, coding standards, and project processes.

## How to create: step by step

I will use a skill that writes clear and direct text as an example, but the process is the same for any skill.

### Step 1: Create the folder

Open the terminal and create the folder inside the personal skills directory:

```bash
mkdir -p ~/.claude/skills/write-text
```

The folder name (`write-text`) will be the command you type: `/write-text`.

### Step 2: Create the SKILL.md file

Inside the folder, create the `SKILL.md` file:

```bash
touch ~/.claude/skills/write-text/SKILL.md
```

### Step 3: Write the frontmatter

Open the file and start with the YAML frontmatter:

```yaml
---
name: write-text
description: >
  Writes clear, direct text for blog articles, technical documentation,
  and internal communications. Uses a professional but accessible tone,
  short sentences, and logical structure.
---
```

The `name` field must match the folder name. The `description` is the most important field: the agent reads all descriptions at session start to know what skills are available. Put the main use case in the first sentence.

### Step 4: Write the instructions

Below the frontmatter, write the instructions the agent will follow:

```markdown
You are a writing assistant specialized in creating clear and direct text in English.

When writing, follow these rules:

1. Use short sentences, between 8 and 25 words each
2. One main idea per sentence
3. Paragraphs of two to five related sentences
4. Professional but accessible tone, no unnecessary jargon
5. Structure the text with introduction, development, and conclusion
6. Prefer concrete examples over abstract explanations
7. Never use em dashes or en dashes in prose
8. Use numbered lists for step sequences

When the user asks for a text, first ask:
- Who is the target audience?
- What is the goal of the text?
- What is the expected length?

After understanding the context, write the complete text.
```

### Step 5: Test

In Claude Code, type `/write-text` and ask it to write something. The agent will read the frontmatter, load the instructions, and execute.

If the skill does not appear, type `/doctor` to diagnose. Also check that the folder name matches the `name` field in the frontmatter.

## Example 2: Skill for organizing files and folders

This skill organizes files in a directory: standardizes names, groups by type, and generates a summary of changes.

Create the folder:

```bash
mkdir -p ~/.claude/skills/organize-folder
```

Create `SKILL.md`:

```yaml
---
name: organize-folder
description: >
  Organizes files in a directory: standardizes names, groups by type
  (images, documents, code, data), and generates a change report.
---
```

```markdown
You are a file organization assistant. When the user asks to organize a folder, follow this process:

1. List all files in the given directory
2. Classify each file by type:
   - Images: .jpg, .png, .gif, .svg, .webp
   - Documents: .md, .txt, .pdf, .docx, .xlsx
   - Code: .py, .js, .ts, .html, .css, .json, .yaml, .toml
   - Data: .csv, .jsonl, .xml
   - Configuration: .env, .gitignore, Dockerfile, Makefile
   - Other
3. Create subfolders for each type (if there are more than 3 files of the same type)
4. Move files to the corresponding folders
5. Standardize filenames: replace spaces with hyphens, remove special characters, use lowercase
6. Generate a markdown report with:
   - Final folder structure
   - File count per type
   - List of renamed files (old name → new name)

Important: before moving or renaming any file, show the plan to the user and ask for confirmation.
```

To test: `/organize-folder ./downloads`

## Example 3: Skill for code review routine

This skill standardizes code review across a team. It checks security, style, performance, and best practices.

```bash
mkdir -p ~/.claude/skills/review-code
```

```yaml
---
name: review-code
description: >
  Structured code review: security, style, performance, and best
  practices. Generates a report with findings by severity.
---
```

```markdown
You are a senior code reviewer. When given a diff or file to review, follow this structure:

1. SECURITY (highest priority)
   - SQL or command injection
   - Credential or secret leakage
   - User input validation
   - Authentication and authorization

2. STYLE AND READABILITY
   - Clear variable and function names
   - Cyclomatic complexity (overly long functions)
   - Missing or unnecessary comments
   - Consistency with the rest of the codebase

3. PERFORMANCE
   - Unnecessary or inefficient loops
   - N+1 database queries
   - Excessive memory allocation
   - Missing caching where it would matter

4. BEST PRACTICES
   - Proper error handling
   - Unit tests for new functionality
   - Dead or commented out code
   - Unnecessary dependencies

Report format:

## Review: [file]

### 🔴 Critical (must be fixed before merge)
- Item 1: explanation and line

### 🟡 Medium (recommended to fix)
- Item 1: explanation and line

### 🔵 Suggestion (optional)
- Item 1: explanation and line

### ✅ Positive points
- Item 1

Always include at least one positive point. Review is not just about criticism.
```

To test: `/review-code src/app.py` or `/review-code` (on the current diff)

## Tips for better skills

**The description is the most important field.** The agent reads all descriptions at session start to decide which skills to load automatically. Put the main use case in the first sentence. If the description is too vague, the agent will never use the skill.

**Use `disable-model-invocation: true` for destructive actions.** If the skill does something irreversible (deploy, deletion, production changes), add this field in the frontmatter so only you can invoke it manually:

```yaml
---
name: deploy
description: "Deploys to production"
disable-model-invocation: true
---
```

**Skills with scripts are more powerful.** You can include Python or shell scripts in the skill folder and reference them in `SKILL.md` using the `${CLAUDE_SKILL_DIR}` variable:

```markdown
Run the validation script before proceeding:
```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/validate.py
```
```

**Test with `/doctor`.** If a skill does not appear, type `/doctor` in Claude Code. It shows which skills are loaded and if any were truncated by the character limit.

**Skills are portable.** The same `SKILL.md` file works in Claude Code, Codex CLI, Gemini CLI, and Cursor. Only the installation directory changes.

## What to do after creating your first skill

Once you create a skill and understand how it works, the next natural steps are:

1. **Create skills for tasks you repeat every week.** Code review, deploy, file organization, commit formatting, changelog generation. Everything you do more than once becomes a skill.

2. **Share skills with your team.** Place them in the `.claude/skills/` directory inside the project repository. When you commit, everyone who clones will have access.

3. **Add scripts.** A skill that only reads instructions is useful. A skill that runs a Python script to validate data before a deploy is much more useful.

4. **Use SkillSpector.** Even on your own skills, running NVIDIA's scanner is good practice to make sure nothing unexpected is there.

## Useful links

- [Claude Code official skills documentation](https://code.claude.com/docs/en/skills)
- [How to create custom skills (Claude Help Center)](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Example repository: skills.sh (community skills)](https://github.com/skills-sh/skills.sh)
- [SkillSpector: security scanner for skills](https://github.com/NVIDIA/SkillSpector)
- [Tutorial: How to Build Custom Claude Code Skills (DEV Community)](https://dev.to/alanwest/how-to-build-custom-claude-code-skills-that-actually-work-2e1f)
- [Tutorial: Building custom skills (Blake Crosby)](https://blakecrosley.com/blog/building-custom-skills)
- [Guide: Adding skills to agents (Codegen)](https://codegen.com/guides/adding-skills-to-agent/)

## Conclusion

Creating your own skill is the most important step you can take to use AI agents with security and productivity. You do not depend on third-party code. You do not expose your data to unverified marketplaces. You create exactly what you need.

The format is simple: a folder, a file, instructions in natural language. If you know how to write a README, you know how to create a skill. And once you create the first one, the second one takes five minutes.

Start with a small task you repeat every week. Turn it into a skill. Next week, that task will not take your time anymore.