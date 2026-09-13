---
title: ".gitignore: The Complete Guide"
description: "Master .gitignore files: patterns, syntax, best practices. From basics to advanced scenarios for efficient Git repositories."
publishDate: 2026-08-07
author: "Alicino"
category: "Ferramentas"
tags: ["git", "gitignore", "version-control", "best-practices"]
draft: false
---

Git makes version control easy, but it doesn't decide what to track. You do.

When you run `git add .` and commit everything, you end up committing generated build artifacts like build and dist folders. You commit dependency caches like node_modules and vendor. You commit secrets like API keys and database passwords. You commit personal IDE configuration that's specific to your machine.

This becomes a mess quickly. Your repository gets bloated with generated files. Secrets leak into the repo. Your teammates waste time dealing with merge conflicts over auto-generated files that shouldn't be in git in the first place.

The solution is .gitignore. It's a simple file that tells Git what NOT to track.

## How .gitignore works

`.gitignore` is a simple text file in your repository root. Each line is a pattern.

```
*.log           # Ignore all .log files
node_modules/   # Ignore the node_modules directory
.env            # Ignore .env file
```

When you run `git add .`, Git matches files against `.gitignore` patterns. Matching files are skipped.

## Basic syntax

### Wildcards

```
# Ignore all Python bytecode
*.pyc
*.pyo
__pycache__/

# Ignore all temp files
temp.*
tmp.*

# Ignore all node modules
*/node_modules/
```

### Directories

```
# Ignore a specific directory
build/
dist/
node_modules/

# Only files named "secret" in any subdirectory
**/secret
```

### Negation (exceptions)

Add a `!` to include files:

```
# Ignore all .log files
*.log

# EXCEPT important.log
!important.log
```

Important: Negation rules only work if the parent directory isn't ignored.

```
# ❌ This won't work (parent directory ignored)
logs/
!logs/important.log

# ✓ This works (parent directory NOT ignored)
*.log
!important.log
```

### Comments

```
# This is a comment
# Ignore test output
*.test
```

## Standard patterns by language

### Python

```
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Virtual environment
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp

# Testing
.pytest_cache/
.coverage
htmlcov/

# Secrets
.env
.env.local
```

### Node.js

```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build output
dist/
build/
*.tgz

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# Testing
coverage/
.nyc_output/

# OS
.DS_Store
Thumbs.db
```

### Ruby

```
# Gems
Gemfile.lock
vendor/bundle/

# Testing
coverage/
.rspec_results/

# IDE
.idea/
.vscode/

# Environment
.env
.env.local

# OS
.DS_Store
```

### Go

```
# Binaries
*.exe
*.dll
*.so

# Build output
dist/
build/

# Vendor directory (optional, commit if reproducibility matters)
vendor/

# IDE
.vscode/
.idea/

# Environment
.env
```

### Java

```
# Build output
target/
build/
out/

# IDE (IntelliJ, Eclipse)
.idea/
*.iml
.classpath
.project

# Gradle
.gradle/
gradle/

# Maven
pom.xml.tag
pom.xml.releaseBackup

# Environment
.env
```

## Real-world examples

### Web application (.gitignore)

```
# Dependencies
/node_modules/
package-lock.json

# Build output
/dist/
/build/
/.next/
/.nuxt/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp

# Testing
/coverage/
.nyc_output/

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# IDE-specific
.eslintcache
.stylelintcache

# Temporary
.cache/
tmp/
temp/
```

### Python project

```
# Virtual environment
venv/
env/
.venv/

# Dependencies
Pipfile.lock
poetry.lock

# Build
build/
dist/
*.egg-info/

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# Environment
.env
.env.local
*.pem

# IDE
.vscode/
.idea/
*.pyc
__pycache__/

# OS
.DS_Store
.AppleDouble
.LSOverride

# Jupyter
.ipynb_checkpoints/
*.ipynb
```

### Docker project

```
# Docker
docker-compose.override.yml

# Build cache
Dockerfile.cache/

# Environment
.env
.env.local

# Logs
docker-logs/

# IDE
.vscode/
.idea/
```

## Advanced patterns

### Match at a specific level

```
# Match only in root
/node_modules/    # Root node_modules only
/build/           # Root build only

# NOT this (matches at any level)
node_modules/     # Matches anywhere
build/            # Matches anywhere
```

### Double asterisk (globstar)

```
# Match at any depth
**/node_modules/  # Any node_modules at any level

# Only files named log at any depth
**/log
```

### Character ranges

```
# Ignore temp files numbered 1-5
temp[1-5].txt

# Ignore files with uppercase extension
*.LOG
*.TMP
```

## Common mistakes

The first big mistake is committing a file and then later adding it to gitignore. You add your .env file, commit it, then realize it shouldn't be in git. You add .env to gitignore, but the file is still in your git history. The solution is to use git rm --cached to remove it from git without deleting it from your disk, commit that change, and then add it to gitignore.

The second mistake is overusing negation rules. You end up with patterns like ignoring all .log files but then trying to keep important.log, debug.log, error.log, and warning.log with multiple negation rules. It gets confusing. Better to use a directory structure like ignoring all .log files except things in logs/important/.

The third mistake is ignoring too much. Setting * to ignore everything and then trying to whitelist things is too aggressive. Better to ignore specific patterns like *.tmp, build/, and node_modules/.

The fourth mistake is not version-controlling lock files. Some teams ignore package-lock.json or poetry.lock. This breaks reproducibility because different developers end up installing different versions. Always commit your lock files and use gitignore only for generated build output.

## Checking what's ignored

### See what .gitignore matches

```bash
# Check if a file is ignored
git check-ignore -v .env
# Output: .gitignore:5:.env

# List all ignored files
git check-ignore -r *
```

### Temporarily include an ignored file

```bash
# Force add (override .gitignore)
git add -f .env

# This is sometimes necessary for secrets files meant to be in git
```

## Team .gitignore

### Global .gitignore (user-level)

Set up once per machine:

```bash
# Create a global gitignore
echo "/.vscode/" >> ~/.gitignore_global
echo "/.idea/" >> ~/.gitignore_global

# Configure git to use it
git config --global core.excludesfile ~/.gitignore_global
```

### Project .gitignore

Always version-control project `.gitignore`:

```bash
git add .gitignore
git commit -m "Add .gitignore"
```

### Per-machine overrides

For secrets that shouldn't go to git but shouldn't be in `.gitignore` (since that would be version-controlled):

```bash
# .git/info/exclude (per-repository, not shared)
echo ".env.local" >> .git/info/exclude
```

## Templates for your language

GitHub provides templates for most languages:

```bash
# Download and use templates
curl https://www.gitignore.io/api/python > .gitignore
curl https://www.gitignore.io/api/node,python > .gitignore
```

Or use a generator:
- https://www.gitignore.io/
- https://github.com/toptal/gitignore

## Secrets management best practices

Never commit secrets. Use one of these approaches:

### Approach 1: Environment variables

```bash
# .env.example (version-controlled, public)
DATABASE_URL=postgresql://localhost/mydb
API_KEY=your_api_key_here

# .env (not version-controlled, local)
DATABASE_URL=postgresql://localhost/mydb
API_KEY=sk_test_1234567890abcdef
```

In `.gitignore`:
```
.env
.env.local
```

### Approach 2: Secret manager

```bash
# Use GitHub Secrets, AWS Secrets Manager, or HashiCorp Vault
# Only fetch secrets at runtime, never commit them
```

### Approach 3: Configuration files

```
/config/secrets.json  # Not committed
/config/secrets.json.example  # Version-controlled template
```

## Debugging gitignore issues

### Files still showing as untracked

```bash
# Clear git's cache
git rm -r --cached .
git add .
git commit -m "Rebuild git index (respect .gitignore)"
```

### A pattern isn't matching

```bash
# Test patterns
git check-ignore -v <pattern>

# If no output, pattern doesn't match anything
# If output shows .gitignore line, pattern matches

# Debug mode
git check-ignore -v -v <pattern>
```

## Conclusion

.gitignore is simple but critical. A well-crafted gitignore keeps your repository clean, prevents secrets from leaking, reduces merge conflicts, and makes collaboration easier.

Start with a template for your language. Add patterns as you discover files that shouldn't be tracked. Always commit your gitignore to the repository. Make it part of your development workflow from day one.

Your teammates will thank you for keeping the repository clean.
