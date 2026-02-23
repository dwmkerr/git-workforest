# workforest Design

## Overview

A TypeScript CLI for managing git repositories with structured worktrees. Each repo gets a folder, each branch gets a subfolder — either as a git worktree or a full clone.

**Repo:** `dwmkerr/git-workforest`
**npm package:** `workforest`
**Binaries:** `git-workforest` and `git-forest` (both auto-discovered by git)

## Directory Model

```
~/.workforest.yaml                                # global config

~/repos/github/dwmkerr/effective-shell/           # repo root (managed by workforest)
├── .workforest.yaml                              # forest marker (empty file)
├── main/                                         # primary branch (initial clone)
├── fix-typo/                                     # worktree (default) or fat clone
└── feature/auth/                                 # nested branch → nested dir
```

`git forest clone dwmkerr/effective-shell`:
1. Resolves path via config pattern → `~/repos/github/dwmkerr/effective-shell/`
2. Clones into `main/` (or whatever the default branch is)
3. Creates `.workforest.yaml` marker in the forest root
4. User cds into `main/` and works normally

`git forest tree fix-typo` (from inside any tree in that repo):
1. Detects which repo you're in (walks up to find `.workforest.yaml` marker)
2. Creates `../fix-typo/` as a git worktree (or full clone if `fatTrees: true`)
3. Checks out the branch (creates it if it doesn't exist)

`git forest init` (interactive):
1. Detects context:
   - **Empty directory:** offers to clone a repo
   - **Inside existing repo:** offers to migrate into forest layout
2. Creates `.workforest.yaml` marker in the forest root

## Commands

```
git forest clone <org/repo>       # clone into structured path
git forest tree <branch>          # create tree for branch
git forest init                   # interactive: clone or migrate
git forest list                   # show trees for current repo
```

All available via both `git forest` and `git workforest`.

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

## Forest Marker (`.workforest.yaml`)

An empty `.workforest.yaml` file in the forest root directory identifies it as a workforest-managed repo. Used by `tree` and `list` to locate the forest root from any subdirectory.

## Install

```bash
npm install -g workforest
```

Both `git-workforest` and `git-forest` binaries are placed on PATH by npm, so `git workforest` and `git forest` both work via git's auto-discovery. No alias configuration needed.

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
│   │   └── list.ts
│   ├── config.ts                    # ~/.workforest.yaml loading
│   ├── git.ts                       # git operations (clone, worktree add, etc.)
│   └── paths.ts                     # path pattern resolution
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

## Quickstart           ← npm install + one example
## Commands             ← clone, tree, init, list with examples
## Configuration        ← ~/.workforest.yaml reference
## How It Works         ← directory model explained
## Developer Guide      ← contributing, building, testing
```

## Not In Scope (For Now)

- tmux integration (sync sessions to forest)
- Multi-provider support beyond GitHub in commands (config supports it)
- `git forest remove` / cleanup commands
- PS1/statusline examples (future docs task)
