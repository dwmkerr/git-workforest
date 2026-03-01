## Context

The CLI has a `tree` command that creates worktrees but doesn't help navigate to them. Users want `git forest checkout <branch>` to work like `git checkout` — just switch to the branch. The `checkout` command replaces `tree` by handling both creation and navigation, finishing with a `cd` hint like `migrate` does.

## Goals / Non-Goals

**Goals:**
- Single command to switch branches: find existing tree or create one
- Print cd suggestion so user can navigate to the tree
- Replace `tree` command entirely

**Non-Goals:**
- Actually changing the shell's working directory (shells can't do this from a subprocess)
- Shell integration or aliases for automatic cd

## Decisions

**Reuse `treeCommand` logic internally**: The existing `treeCommand` function handles worktree/fat-clone creation. `checkout` will call it when no tree exists, avoiding duplication.

**Check existing trees via `statusTrees`**: Use the existing `statusTrees` function to find if a tree already exists for the branch, rather than reimplementing tree discovery.

**Same cd hint pattern as migrate**: Print `cd <relative-path>` in cyan at column 0, matching the established pattern.

## Risks / Trade-offs

- Removing `tree` is a breaking change for anyone using it directly → acceptable at this stage since the tool is pre-1.0
