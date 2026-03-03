

Tmux better integration, show optional tree icon

workforest autocomplete

Make it a skills/plugin with info on how to do this

**Wyhy**

in readme note:

```
$ git switch main
fatal: 'main' is already used by worktree at ...
```

Also note that there is little consistency in where worktrees are stored.

**Superpowers**

Superpowers subagent workforest


**`forest init` — unified entry point**

`git forest init` should detect context and do the right thing:
- Inside a regular repo → offer to migrate to forest layout
- Inside a forest → confirm status, show trees
- Not in a repo → offer to clone (like `git forest clone`)

`git forest clone` is analogous to `git clone` but uses forest structure and creates the `.workforest.yaml` marker. `forest init` would be the "I'm here, do the right thing" command.

**Migrate: detect existing worktrees**

On migrate, detect existing worktrees and show them in the preview instead of placeholder `<branch-1>/` names. Crop the list if there are many, e.g. `(additional 5 worktrees)`.

Do config like in dwmkerr/workforest/main main ! conda/base
$ git forest checkout feat/config
error: unknown command 'checkout'

dwmkerr/workforest/main main ! 1 in stash conda/base
$

