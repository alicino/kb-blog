---
title: "The importance of a good .gitignore for your repository and how to fix mistakes"
description: "A complete guide to .gitignore: why it is essential, examples by language, how to avoid AI tool files, and a step-by-step guide to removing sensitive data from Git history."
publishDate: 2026-08-07
author: "Alicino"
category: "Engenharia"
tags: ["git", "security", "best-practices", "tutorial", "devops"]
draft: false
---

Have you ever stopped to think about what happens when you run `git add .` and then `git commit`? Git picks up everything in your project folder. Everything. Configuration files with passwords, dependency folders, temporary operating system files, and even personal notes. Without a good `.gitignore`, your repository becomes a dump of files that should not be there. And the worst part: once something sensitive enters Git history, simply deleting the file does not fix it. It stays there, accessible to anyone who looks at old commits.

This article explains why `.gitignore` is one of the first lines of defense for your project's security. We will cover practical examples for different languages, learn how to avoid AI tool files, and discover how to clean up history when a mistake happens.

## What you will learn

1. Why `.gitignore` is essential for any project
2. Examples of files and folders to ignore by language
3. How to prevent AI and personal tool files from entering the repository
4. A real scenario: what to do when you accidentally commit a `.env` file
5. How to clean Git history with `git filter-repo`

## What is .gitignore and why it matters

The `.gitignore` is a plain text file at the root of your repository. It tells Git which files and folders to completely ignore. Git does not track these files, does not include them in commits, and does not send them to the remote repository.

Without a `.gitignore`, you face serious risks:

1. **Credential leakage**: Files like `.env`, `config.json` with passwords, or certificates can be publicly exposed
2. **Repository pollution**: Folders like `node_modules/` or `__pycache__/` contain thousands of files that are not part of your project
3. **Unnecessary conflicts**: Automatically generated files can cause conflicts between developers
4. **Personal data exposure**: AI tools and editors create files that reveal how you work

## Basic .gitignore syntax

Before looking at examples, it helps to understand how `.gitignore` works. The syntax is simple but powerful. You can use glob patterns, exceptions, and rules that apply at any level of the project.

Basic example:

```text
# This is a comment. Everything after the hash is ignored by Git.

# Ignore a specific file
secrets.txt

# Ignore an entire folder
node_modules/

# Ignore all .log files in any folder
*.log

# But do NOT ignore important.log (the exclamation mark negates the rule)
!important.log

# Ignore all files in any build/ folder in the project
**/build/
```

The `secrets.txt` line tells Git to ignore only that specific file at the root. `node_modules/` ignores the entire folder and everything inside it. `*.log` uses an asterisk as a wildcard, so any file ending in `.log` is ignored regardless of name. The exclamation mark in `!important.log` creates an exception. And `**/build/` is powerful: the double asterisk tells Git to look for a folder named `build` anywhere in the project, not just at the root.

## Examples by language

### Node.js / JavaScript

When you work with Node.js, the first thing you notice is the `node_modules/` folder. It appears as soon as you run `npm install` and can contain thousands of files. These are your project's dependencies, and they are not yours. Every developer can install them locally with a single command. Taking them to Git is like trying to store the entire library when you only need the catalog.

```text
# Dependencies: this folder contains everything npm/yarn downloads.
# You recreate it with npm install, so no need to version it.
node_modules/

# npm and yarn debug logs. They show temporary errors
# and are generated automatically when something goes wrong.
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Lock files. They pin exact dependency versions.
# In private projects, some teams version them. In open source
# libraries, they are usually ignored for flexibility.
package-lock.json
yarn.lock

# Environment variables. YOUR PASSWORDS LIVE HERE.
# Never, under any circumstances, version this file.
.env
.env.local
.env.*.local

# Build and cache folders. Generated when you compile
# the project. Source code is already versioned, build is not.
dist/
build/
.cache/
.parcel-cache/

# Application logs. They grow over time and are specific
# to your machine. Every developer generates their own.
logs/
*.log

# Test coverage reports. Generated when you run
# the test suite and show which lines were executed.
coverage/
.nyc_output/

# IDE configurations. They are personal and do not affect the project.
# Every developer uses their preferred editor.
.vscode/
.idea/
*.swp
*.swo
```

Note that `package-lock.json` and `yarn.lock` are special cases. In a private company project, versioning `package-lock.json` ensures everyone uses exactly the same dependency versions. This prevents the classic "it works on my machine" problem. But if you are creating an open source library, versioning the lock file can cause headaches for those who use your library. The rule is: decide consciously and discuss with your team.

### Python

Python is a wonderful language, but it leaves traces. When you run a `.py` file, the interpreter creates compiled bytecode to speed up the next execution. This bytecode goes into `__pycache__/`. The problem is that this bytecode is specific to the Python version and operating system. If you version it, your Linux colleague will receive bytecode generated on your macOS, and that simply does not make sense.

```text
# Compiled Python bytecode. Generated automatically
# when you run a script. Specific to your machine.
__pycache__/
*.py[cod]
*$py.class
*.so

# Virtual environments. Isolated Python installations
# for this specific project. Every developer creates their own.
venv/
env/
ENV/
.venv/

# Build and distribution folders. Contain the generated package
# for PyPI publication. You recreate when needed.
build/
dist/
*.egg-info/
.eggs/

# Test cache and coverage. Generated when running pytest
# or coverage tools. They are temporary.
.pytest_cache/
.coverage
htmlcov/

# Environment variables. Same rule: passwords do not go to Git.
.env
.env.local

# IDE configurations. Personal to each developer.
.vscode/
.idea/
*.swp

# Jupyter Notebook checkpoints. Jupyter saves automatic
# snapshots of your notebooks. They pollute the repository.
.ipynb_checkpoints/
```

Special attention to `__pycache__/`. Many people new to Python do not understand why to ignore this folder. The answer is simple: it is a cache. Your source code is what matters. `__pycache__/` is just an optimization that Python recreates on its own. Versioning cache is like versioning your browser's temporary folder.

### Go

Go has a different philosophy. The language was designed to be simple and direct. When you compile a Go program, it generates an executable binary. This binary is specific to the architecture where it was compiled. A binary compiled on macOS does not run on Linux, so there is no point in versioning it.

```text
# Compiled binaries. Generated with go build.
# Specific to the operating system and architecture.
*.exe
*.exe~
*.dll
*.so
*.dylib

# Compiled test files. Go generates temporary binaries
# when you run go test.
*.test
*.out

# Vendored dependencies (optional). Go can copy
# dependencies to a vendor/ folder. Some teams version
# them to ensure reproducible builds. Others prefer
# go modules. Decide with your team.
# vendor/

# Environment variables. Always ignore.
.env
.env.local

# IDE configurations. Personal.
.vscode/
.idea/
*.swp

# Go workspace files. Workspace configuration files
# specific to your local setup.
go.work
go.work.sum
```

The `# vendor/` line is commented on purpose. In Go, there is a healthy debate about versioning the `vendor/` folder. When you version it, you guarantee the project always compiles with the same dependencies, even if the original repository disappears. But it increases the repository size. The practical rule is: application projects (that will be deployed) usually version it. Libraries (that will be imported) generally do not.

### Ruby

```text
# Bundler dependencies in vendor mode.
# Each environment installs its own gems.
/vendor/bundle
/.bundle

# Environment variables. Always.
.env
.env.local

# Rails/Rack logs and temporary files.
# Generated during execution and grow endlessly.
/log/*
/tmp/*

# But keep .keep files, since Git does not version
# empty folders. The .keep is a trick to maintain structure.
!/log/.keep
!/tmp/.keep

# Test cache and Capybara temporary files.
*.rbc
capybara-*.html
.rspec

# Development SQLite database.
# A binary file that changes with every request.
*.sqlite3
*.sqlite3-journal

# IDE configurations. Personal.
.vscode/
.idea/
*.swp
```

### Java

```text
# Compiled bytecode. Generated by javac from .java files.
*.class

# Packages and compressed files. Generated by the build
# process for distribution. You recreate when needed.
*.jar
*.war
*.ear
*.zip
*.tar.gz
*.rar

# Maven: target folder and temporary release files.
# The target/ folder contains the complete project build.
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup

# Gradle: build folder and cache.
# Gradle maintains a local cache to speed up builds.
build/
.gradle/

# But do not ignore the Gradle wrapper. It allows
# anyone to compile the project without having Gradle installed.
!gradle/wrapper/gradle-wrapper.jar

# Java IDE configurations. Many files and all personal.
.idea/
*.iml
*.ipr
*.iws
.classpath
.project
.settings/

# Environment variables. Always.
.env
```

## AI and personal tool files

Now let us talk about something many people still do not consider: files that AI tools and code assistants create in your project. They may seem harmless, but they deserve attention.

```text
# AI and code assistant files.
# They may contain project-specific instructions,
# business context, or references to internal systems.
# Useful for you, but should not be public.
CLAUDE.md
claude.md
.cursorrules
.cursor/
.github/copilot-instructions.md

# Personal IDE settings.
# These files store your editor preferences:
# themes, font size, custom shortcuts.
# They do not affect the project and are specific to your machine.
.vscode/settings.json
.vscode/launch.json
.idea/workspace.xml
.idea/tasks.xml

# Command history and REPL sessions.
# May contain commands with passwords or sensitive data
# you typed during an interactive session.
.bash_history
.zsh_history
.node_repl_history

# Operating system files.
# macOS creates .DS_Store in every folder to store
# view settings. Windows creates Thumbs.db
# for thumbnail cache. Nothing to do with your project.
.DS_Store
Thumbs.db
desktop.ini

# Backup files created by editors.
# Vim creates *~ and .swp files. Other editors
# create .bak. Temporary recovery files.
*~
*.bak
*.tmp
*.temp
```

## The emergency scenario: committing .env

Now let us get to the part nobody wants to experience, but everyone should know how to handle. Imagine this scene: it is Friday night, you are finishing an important feature. You configure environment variables in the `.env` file, test locally, everything works. On autopilot, you run:

```bash
git add .
git commit -m "feat: add database configuration"
git push origin main
```

Three commands. Three seconds. And now your database connection string, with username and password in plain text, is in Git history. Forever. Or at least until you act correctly.

### The problem

You might think: "It is fine, I will delete the file and make another commit." But Git does not work that way. Git keeps the complete history of all changes. Anyone with access to the repository can run:

```bash
git log --all --full-history -- .env
```

And see every commit where `.env` appeared. With `git show <commit>:.env`, they can see the complete file content at that moment. Deleting the file in a new commit does not erase the file from old commits. It is like deleting a photo from your feed, but it still exists in the server backups.

### The solution: git filter-repo

`git filter-repo` is the modern, recommended tool for rewriting Git history. It is faster, safer, and easier to use than the old `git filter-branch`.

#### Step 1: Install git filter-repo

```bash
# macOS with Homebrew
brew install git-filter-repo

# Ubuntu/Debian
sudo apt-get install git-filter-repo

# Python (works on any system with Python)
pip install git-filter-repo
```

#### Step 2: Clone a fresh repository

```bash
# Mirror clone brings the entire history, including all branches
git clone --mirror https://github.com/your-user/your-repo.git
cd your-repo.git
```

#### Step 3: Remove the file from history

```bash
git filter-repo --invert-paths --path .env --force
```

What this command does:
1. `--invert-paths` inverts the logic: instead of keeping only the specified paths, it removes them
2. `--path .env` specifies which file or folder to remove
3. `--force` is needed because filter-repo detects you are in a mirror clone

#### Step 4: Update the remote repository

```bash
git remote add origin https://github.com/your-user/your-repo.git
git push origin --force --all
```

**Important**: After this force push, all other developers need to clone the repository again. If they try to pull, they will get conflicts because their history does not match the remote.

#### Step 5: Add to .gitignore

```bash
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: add .env to .gitignore"
git push origin main
```

## Other common situations

### Situation 1: Committed node_modules/

You forgot to create `.gitignore` before the first commit and `node_modules/` with 50 thousand files entered the repository. Now every clone takes minutes.

```bash
git filter-repo --invert-paths --path node_modules/ --force
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "chore: add node_modules to .gitignore"
```

### Situation 2: File is in .gitignore but Git still tracks it

Sometimes you add a file to `.gitignore`, but Git keeps tracking it because it was already in the index before the rule existed.

```bash
# Remove from Git index but keep the file on disk
git rm --cached .env

# Commit the removal from tracking
git commit -m "chore: remove .env from tracking"
```

## Conclusion

A good `.gitignore` is one of the simplest and most effective security measures for any project. It prevents credential leaks, keeps the repository clean, and avoids unnecessary conflicts. Combined with tools like `git filter-repo` for fixing past mistakes, you have everything you need to keep your repository safe and organized.

## Sources

1. **Git Documentation** — Official Git documentation on .gitignore. https://git-scm.com/docs/gitignore
2. **git filter-repo** — Official repository. https://github.com/newren/git-filter-repo
3. **GitHub's gitignore templates** — Collection of .gitignore templates by language. https://github.com/github/gitignore
4. **Atlassian: git filter-repo tutorial** — Step-by-step guide. https://www.atlassian.com/git/tutorials/git-filter-repo