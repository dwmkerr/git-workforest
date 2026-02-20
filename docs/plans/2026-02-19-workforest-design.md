# workforest Design

## Overview

A TypeScript CLI for managing git repositories with structured worktrees. Each repo gets a folder, each branch gets a subfolder — either as a git worktree or a full clone.

**Repo:** `dwmkerr/git-workforest`
**npm package:** `workforest`
**Binary:** `git-workforest` (auto-discovered as `git workforest`)
**Alias:** `git forest` (set by installer)

## Directory Model

```
~/.workforest.yaml                                # global config

~/repos/github/dwmkerr/effective-shell/           # repo root (managed by workforest)
├── main/                                         # primary branch (initial clone)
├── fix-typo/                                     # worktree (default) or fat clone
└── feature/auth/                                 # nested branch → nested dir
```

`git forest clone dwmkerr/effective-shell`:
1. Resolves path via config pattern → `~/repos/github/dwmkerr/effective-shell/`
2. Clones into `main/` (or whatever the default branch is)
3. User cds into `main/` and works normally

`git forest tree fix-typo` (from inside any tree in that repo):
1. Detects which repo you're in
2. Creates `../fix-typo/` as a git worktree (or full clone if `fatTrees: true`)
3. Checks out the branch (creates it if it doesn't exist)

`git forest init` (from inside an existing repo):
1. Restructures the current repo into the forest layout
2. Moves the clone into a `main/` subfolder

## Commands

```
git workforest clone <org/repo>       # clone into structured path
git workforest tree <branch>          # create tree for branch
git workforest init                   # migrate current repo into forest layout
git workforest list                   # show trees for current repo
git workforest info                   # current repo/tree context
```

All available via `git forest` alias.

## Config (`~/.workforest.yaml`)

```yaml
# Path pattern for cloning repos
# Available tokens: [provider], [org], [repo]
reposDir: ~/repos/[provider]/[org]/[repo]

# Subdirectory pattern for trees
# Available tokens: [branch]
treeDir: "[branch]"

# Use full clones instead of git worktrees
fatTrees: false
```

All fields optional — sensible defaults for everything.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/dwmkerr/git-workforest/main/install.sh | sh
```

Which does:
```bash
npm install -g workforest
git config --global alias.forest workforest
```

Binary `git-workforest` is placed on PATH by npm, so `git workforest` works via git's auto-discovery. The alias gives `git forest` as shorthand.

## Project Structure

```
git-workforest/
├── bin/
│   └── git-workforest.js            # #!/usr/bin/env node entry point
├── src/
│   ├── cli.ts                       # commander setup
│   ├── commands/
│   │   ├── clone.ts
│   │   ├── tree.ts
│   │   ├── init.ts
│   │   ├── list.ts
│   │   └── info.ts
│   ├── config.ts                    # ~/.workforest.yaml loading
│   ├── git.ts                       # git operations (clone, worktree add, etc.)
│   └── paths.ts                     # path pattern resolution
├── install.sh                       # curl | sh installer
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Tech Stack

Follows the openspec pattern:
- TypeScript (ESM)
- commander (CLI framework)
- chalk (terminal colors)
- ora (spinners)
- yaml (config parsing)
- zod (config validation)
- vitest (testing)

## README Structure

```
<centered header>
  🌲 git-workforest
  Managed worktrees with structure. Clone once, branch into folders.
  <hero gif>
  Quickstart | Commands | Configuration | Developer Guide
  <badges: cicd, npm, codecov>
</centered header>

## Quickstart           ← curl|sh install + one example
## Commands             ← clone, tree, init, list, info with examples
## Configuration        ← ~/.workforest.yaml reference
## How It Works         ← directory model explained
## Developer Guide      ← contributing, building, testing
```

## Not In Scope (For Now)

- tmux integration (sync sessions to forest)
- Multi-provider support beyond GitHub in commands (config supports it)
- `git forest remove` / cleanup commands
- PS1/statusline examples (future docs task)
