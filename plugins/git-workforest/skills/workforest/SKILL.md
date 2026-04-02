---
name: workforest
description: "This skill should be used when the user asks about 'workforest', 'git forest', 'git forest list', 'git forest add', 'git forest remove', 'forest layout', or mentions managing worktrees with workforest. Also use when the user asks how workforest works, how to use git forest commands, or how to navigate a forest."
user-invocable: true
---

# Working with git-workforest

git-workforest manages git worktrees with a simple, predictable folder structure. Like `git worktree`, but handles paths for you. Each branch gets its own directory.

## Detecting a forest

A directory is a forest if it contains a `.workforest.yaml` marker file. Trees (worktrees) are subdirectories that are git checkouts.

## Commands

| Command | Purpose | Git worktree equivalent |
|---------|---------|------------------------|
| `git forest list` | List all trees in the forest | `git worktree list` |
| `git forest add <branch>` | Add a tree for a branch | `git worktree add <path> <branch>` |
| `git forest remove <branch>` | Remove a tree from the forest | `git worktree remove <path>` |
| `git forest remove -f <branch>` | Force remove (even if dirty) | `git worktree remove --force <path>` |
| `git forest clone <org/repo>` | Clone into structured forest path | `git clone` |
| `git forest migrate` | Convert existing repo to forest layout | - |
| `git forest init` | Detect context and set up a forest | - |

## Forest layout

```
my-project/                    # forest root (.workforest.yaml here)
  main/                        # default branch (primary clone)
  feat/
    dark-mode/                 # git worktree or fat clone
    sessions-view/
  fix/
    login-bug/
  docs/
    readme/
```

## List output conventions

`git forest list` mirrors `git branch -l` colours:

```
on branch feat/dark-mode in org/repo

trees:
  main            ./main
+ docs/readme     ./docs/readme
* feat/dark-mode  ./feat/dark-mode
+ fix/login-bug   ./fix/login-bug
```

- `*` (green) - active tree (cwd is inside it)
- `+` (cyan) - worktree branch
- blank - default branch when not active
- Paths are bright white with `./` prefix
- Default branch sorts first, rest alphabetical

## Working in a forest

- Each tree is an independent working directory - no stashing needed to switch branches
- `cd` between trees to switch context
- Run `git forest list` from any tree or the forest root to see all branches
- The forest root is the parent of all trees, identified by `.workforest.yaml`

## Adding and removing trees

```bash
git forest add feat/new-feature    # creates ./feat/new-feature/
git forest add fix/bug-123         # creates ./fix/bug-123/
git forest remove fix/bug-123      # removes the tree (refuses if dirty)
git forest remove -f fix/bug-123   # force remove even with uncommitted changes
```

Trees are created as git worktrees by default, or as full clones if `fatTrees: true` is set in `~/.workforest.yaml`.

## When helping users in a forest

- If the user is in a forest, use `git forest list` to understand the layout
- When suggesting branch operations, prefer `git forest add` over `git checkout`
- After add, remind the user to `cd` to the new tree directory
- The forest root is NOT a git repo - individual trees are
