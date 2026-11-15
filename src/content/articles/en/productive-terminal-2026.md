---
title: "Putting together a productive terminal in 2026"
description: "Without turning it into a hobby: a lean terminal setup that handles 90% of day to day work."
publishDate: 2026-05-15
author: "Alicino"
category: "Ferramentas"
tags: ["terminal", "cli-tools", "productivity"]
draft: false
---

Setting up your terminal is one of the most common hobbies disguised as
productivity among people who code. This is the point where I stopped tinkering.

## The essentials, without going overboard

- A shell with history shared between sessions.
- Shortcuts for the three or four commands you use all day long.
- A prompt that shows the branch, git status, and the exit code of the last
  command, nothing more.

## What I decided not to use

Terminal plugins with animations, file previews, or elaborate integrations with
external services. Every second of latency in a terminal adds up over the day.

```bash
alias gs="git status --short --branch"
alias gd="git diff"
```

Two lines of configuration that I use more than any sophisticated plugin I've
ever tried.

## A practical rule for adding something new

Before adding a tool to the terminal, I ask: will this save time today, or does
it only seem interesting to set up once and then never notice again?
