---
title: ".gitignore: The Complete Guide"
description: "The complete .gitignore reference: pattern syntax with verified examples, negation that actually works, precedence between ignore files, and how to debug any pattern."
publishDate: 2026-08-07
author: "Alicino"
category: "Ferramentas"
tags: ["git", "gitignore", "version-control", "best-practices"]
draft: false
---

<img src="/assets/img/2026-08-07-gitignore-complete-guide-en-1.png" alt="Cover of the complete .gitignore guide: pattern syntax, negation, precedence and debugging" width="1200" height="333" />

Git tracks changes, but it never decides what deserves to be tracked. That decision is yours, and it is written in a file most people copy from somewhere else and never truly read: `.gitignore`.

The cost of not reading it is quiet. You run `git add .` and your `node_modules/` goes along. Your `dist/` goes along. A `.env` file with a database password goes along, and it stays in history forever, because Git never forgets a commit.

This guide is a reference. Every pattern below was tested against Git, and where a common recipe is wrong, the wrong version appears next to the correct one so you can recognise them when you meet them.

## What you will learn

By the end of this guide you will be able to read any `.gitignore` file and predict exactly what it does. Specifically:

- The four places Git reads ignore rules from, and which one to use in each situation
- Pattern syntax, one rule at a time, with the case that breaks it
- Why negation fails more often than people expect, and the two ways to fix it
- Ready-to-use bases for Python, Node.js, Go, Ruby, Java, and Docker

## How .gitignore works

A `.gitignore` file is plain text, one pattern per line. Git reads it when deciding whether a file is "untracked" or "ignored".

Three details in that sentence matter more than they appear to.

First, `.gitignore` only affects **untracked** files. If a file is already tracked, adding it to `.gitignore` changes nothing: Git keeps tracking it. This is the most common source of confusion, so it gets its own section further down.

Second, a pattern matches **paths**, not file contents. Git never opens your files to decide whether to ignore them.

Third, patterns are **relative to the file that contains them**. A `.gitignore` inside `src/` interprets `build/` differently from one in the repository root.

## The four places Git reads patterns from

Git does not have one ignore file. It has four sources with a precedence order, and most problems blamed on "gitignore not working" are actually a rule living in a source the user does not know exists.

From highest precedence to lowest:

1. **Patterns passed on the command line**, for commands that accept them.
2. **`.gitignore` files in the tree** — the file in the same directory as the path, or in any parent directory up to the repository root. A rule in a deeper file overrides the same rule in a shallower one. These are the ones you commit and share with the team.
3. **`.git/info/exclude`** — patterns specific to your clone, shared with nobody. Ideal for personal scratch files that live inside the repository.
4. **The file named by `core.excludesFile`** — your machine-wide ignore file, defaulting to `$XDG_CONFIG_HOME/git/ignore`, which is `~/.config/git/ignore` when that variable is unset. This is where editor and OS junk belongs, so you never write `.DS_Store` again in any project.

The practical rule: if every developer should ignore it, it goes in `.gitignore`. If it is only about your machine, it goes in `~/.config/git/ignore`. If it is about this repository but only for you, use `.git/info/exclude`.

## Pattern syntax, rule by rule

### The slash decides how far a pattern reaches

This rule causes the most silent damage, so it comes first.

- If the pattern contains a slash **at the beginning or in the middle**, it is anchored to the directory of the `.gitignore` file itself.
- If it does **not** contain a slash, it can match at **any level** below.

```
/build/        # only the root build/
src/build/     # only src/build/
build/         # build/ at any level
```

Tested: with `build/`, both `build/a.txt` and `src/build/b.txt` are ignored. With `/build/`, only `build/a.txt` is.

### A trailing slash means "directories only"

A pattern ending in `/` matches directories, and therefore everything inside them. Without the trailing slash, the pattern can match a file or a directory with that name.

```
foo/     # a directory named foo, and everything under it
foo      # any file or directory named foo
```

### An asterisk never crosses a slash

`*` matches anything **except** a slash. That single detail invalidates a recipe you will find in many blog posts:

```
# ✗ WRONG — and this is a very common mistake
*/node_modules/

# ✓ CORRECT
node_modules/
```

Tested against a tree with `node_modules/`, `app/node_modules/` and `app/lib/node_modules/`:

- `node_modules/` ignores **all three**.
- `*/node_modules/` ignores **only** `app/node_modules/`, because `*` matches exactly one path segment. It misses both the root one and the one two levels deep.

The comment that usually accompanies the wrong version says "ignore all node modules". It does not.

### Negation, and why it usually fails

A pattern starting with `!` re-includes a file that an earlier pattern excluded. Order matters, and so does the parent directory.

Here is the failure that surprises everyone. The pattern on the left looks right and does nothing:

```
# ✗ WRONG — important.log is still ignored
logs/
!logs/important.log

# ✓ CORRECT
logs/*
!logs/important.log
```

The reason is in the official manual: **it is not possible to re-include a file if a parent directory of that file is excluded**. Git does not descend into excluded directories, so it never sees `logs/important.log` in order to reconsider it. That rule exists purely for performance.

Tested: with `logs/` plus `!logs/important.log`, both files stay ignored. Change the first line to `logs/*` and `important.log` becomes free while `error.log` stays ignored.

The second thing to know about negation is that it needs a path, not a hope. This recipe from the manual excludes everything except one directory:

```
/*
!/foo
/foo/*
!/foo/bar
```

Note the `/*` rather than `*`. Without the leading slash the wildcard would also swallow everything inside `foo/bar`.

### Globstar: three documented forms

Two consecutive asterisks behave specially only in three positions. Everywhere else they are just two ordinary asterisks.

```
**/foo          # a file or directory named foo anywhere
abc/**          # everything inside abc, at infinite depth
a/**/b          # a/b, a/x/b, a/x/y/b — zero or more directories
```

Tested: `abc/**` ignores `abc/a.txt` and `abc/x/y/b.txt`, but leaves `other/abc/c.txt` alone, because the pattern is anchored to the directory holding the `.gitignore`.

### Character ranges and the question mark

```
temp[1-5].txt    # temp1.txt through temp5.txt
file?.log        # file followed by exactly one character
*.LOG            # uppercase extensions are a separate pattern
```

Patterns are **case-sensitive** on Linux and macOS by default. `*.log` does not cover `LOG` or `File.LOG`.

### Escaping a literal ! or #

```
\!important.txt    # a file that really starts with !
\#notes.txt        # a file that really starts with #
```

Both confirmed to match the literal filenames.

### Comments, blank lines, and a trailing-space trap

A line starting with `#` is a comment. A blank line matches nothing and is a legitimate way to separate blocks. Trailing spaces are **ignored** unless escaped with a backslash, which is a real trap when you paste patterns from a web page.

## Precedence when several files disagree

When two rules match the same path, the more specific location wins, and within a single file the **last matching pattern** wins. That is what makes the `logs/*` plus `!logs/important.log` pair work: the second line comes after the first, in the same file.

A worked example from the manual, using a nested file. The root `.gitignore` contains `vmlinux*`. Then a nested file re-includes one path:

```bash
echo '!/vmlinux*' > arch/foo/kernel/.gitignore
```

Because the nested file is deeper, its rule overrides the root one for that directory only.

## Ready-to-use bases

These are starting points, not finished files. Delete what does not apply instead of accumulating lines you cannot explain.

### Python

```gitignore
# Byte-compiled files
__pycache__/
*.py[cod]
*$py.class
*.so

# Virtual environments
venv/
env/
.venv/

# Distribution and build
build/
dist/
*.egg-info/

# Testing and coverage
.pytest_cache/
.coverage
htmlcov/
.tox/

# Secrets — never committed
.env
.env.local
*.pem
```

### Node.js

```gitignore
# Dependencies
node_modules/

# Build output
dist/
build/
.next/
.nuxt/

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
logs/

# Testing
coverage/
.nyc_output/

# Caches
.eslintcache
.cache/

# OS and editor
.DS_Store
Thumbs.db
```

### Go

```gitignore
# Binaries
*.exe
*.dll
*.so
*.dylib

# Build output
build/
dist/

# Test artifacts
*.test
*.out
coverage.txt

# Environment
.env
```

Note the deliberate absence of `vendor/`. In Go, vendoring is a legitimate choice for reproducible builds. Whether you ignore it depends on your team's decision, not on taste.

### Ruby

```gitignore
# Bundler
vendor/bundle/
.bundle/

# Build artifacts
pkg/
*.gem

# Testing
coverage/
.rspec_results/

# Environment
.env
.env.local
```

### Java

```gitignore
# Build output
target/
build/
out/

# Gradle
.gradle/

# Maven
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup

# IDE
.idea/
*.iml
.classpath
.project
.settings/
```

### Docker

```gitignore
# Local compose overrides
docker-compose.override.yml

# Environment
.env
.env.local

# Logs
docker-logs/
*.log
```

## Do not ignore your lock files

This one is a decision, not a detail, and getting it wrong breaks reproducibility.

`package-lock.json`, `yarn.lock`, `poetry.lock`, `Pipfile.lock` and `Gemfile.lock` record the exact versions every developer and every deploy will install. Ignoring them means each machine resolves its own versions, and "it works on my machine" becomes a permanent condition.

Commit your lock files. Keep `.gitignore` for generated output and secrets.

## The mistake that already happened: a file tracked before you ignored it

Adding a file to `.gitignore` does **not** stop Git from tracking it. If it was committed, it stays committed, and it keeps showing up in `git status`, which is why people conclude "the pattern is broken".

The pattern is fine. The file is tracked. Remove it from the index while keeping it on disk:

```bash
git rm --cached .env
git commit -m "Stop tracking .env"
```

Use `--cached`. Plain `git rm .env` also deletes the file from your working directory, which for a `.env` means deleting your own credentials. If you are removing a directory, add `-r`:

```bash
git rm -r --cached node_modules/
```

Be aware of what this does **not** fix: the file is still in every previous commit, and anyone who clones can recover it. If what leaked was a real secret, rotate the credential first. Rewriting history is a separate job, and a much larger one.

## Debugging any pattern with git check-ignore

`git check-ignore` is the tool for this, and it is worth learning properly because the version circulating online does not exist.

```bash
# Which rule is responsible for ignoring this file?
git check-ignore -v .env
# .gitignore:12:.env

# Several paths at once
git check-ignore -v node_modules/ dist/ .env

# A whole list, fed on stdin — the safe way to do a bulk check
git ls-files --others | git check-ignore -v --stdin

# Also show files that are NOT ignored, so you can tell the difference
git check-ignore -v --no-index -n .env
```

The output format is `source:line:pattern`. That is what makes the command useful: it does not just tell you the file is ignored, it tells you **which line of which file** did it, which resolves the four-source precedence problem in seconds.

Two field notes from real use:

- The variant `git check-ignore -r *` found in older guides fails with `error: unknown switch 'r'`. There is no `-r`. To feed a whole tree, use `--stdin` as shown above.
- Without `-v` and `-n` you cannot distinguish "no matching pattern" from "matched a negated pattern", because both print nothing.

Exit status is meaningful in scripts: `0` when at least one path is ignored, `1` when none are, `128` on a fatal error.

To inspect the whole repository instead of a single path:

```bash
git status --ignored              # ignored files, grouped
git status --ignored -uall        # every file, one per line
git ls-files --others --ignored --exclude-standard
```

## Using the official templates

The best starting point is the repository GitHub itself maintains:

```
https://github.com/github/gitignore
```

It is organised by language and framework, and it accepts contributions. There is also `gitignore.io`, which generates a combined file from several templates. Worth knowing before you rely on it: the template repository it depends on was **archived on 24 January 2025** and is read-only, so it no longer receives new templates. It still works for established stacks, but for anything recent, check `github/gitignore` first.

Whichever you choose, copy and trim. A generated file with 200 lines you did not read is worse than 20 lines you understand, because the day something is ignored that should not be, you will have to bisect rules you do not recognise.

## Team habits that keep .gitignore healthy

Four practices prevent almost every problem in this guide:

**Treat `.gitignore` as code.** It lives in the repository, it gets reviewed, and changes to it come with a reason. An unexplained `*.json` line can hide a config file the whole team expects to be tracked.

**Use `.git/info/exclude` for personal files.** Your scratch scripts and editor backups should not create review noise for anyone else.

**Use a global ignore file for OS and editor junk.** Configure it once:

```bash
git config --global core.excludesFile ~/.config/git/ignore
```

Then `.DS_Store`, `Thumbs.db` and `*.swp` stop appearing in every project's diff.

**Add patterns as you meet them, and say why.** A comment above an unusual pattern is worth more than a bullet in a style guide, because it tells the next person whether the rule is still needed.

## Conclusion

`.gitignore` rewards being read literally. The slash decides reach, `*` never crosses a slash, a trailing slash means directory, and negation cannot rescue a file inside an excluded directory. Those four rules explain nearly every bug you will encounter.

The workflow that holds up: start from a maintained template, keep the file versioned and reviewed, put personal and machine-specific rules in the right of the four sources, commit your lock files, and reach for `git check-ignore -v` instead of guessing.

And when a secret is already committed, remember the order of operations: remove it from the index, then rotate the credential. The history rewrite is the last step, not the first.

## Sources and links

- [gitignore — official manual page](https://git-scm.com/docs/gitignore) — the normative reference for every pattern rule in this guide
- [git-check-ignore — official documentation](https://git-scm.com/docs/git-check-ignore) — options, output format and exit status
- [github/gitignore](https://github.com/github/gitignore) — the maintained collection of templates, with contribution rules
- [GitHub Docs: Ignoring files](https://docs.github.com/en/get-started/git-basics/ignoring-files) — the per-language entry point for everyday use
- [gitignore.io · issue #650](https://github.com/toptal/gitignore.io/issues/650) — record of the template repository being archived on 24 January 2025
