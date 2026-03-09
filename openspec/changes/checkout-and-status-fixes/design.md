## Context

`statusTrees` uses `fs.readdir` on the forest root which only returns immediate children. Trees at `feat/branch-name` are nested two levels deep and missed. Checkout relies on `statusTrees` to find existing trees, so it also fails.

## Decisions

1. **Recursive scan in `statusTrees`** — walk subdirectories recursively, test each for a `.git` dir. Skip known non-tree dirs (node_modules, .git). Use the relative path from forest root as the tree name (e.g. `feat/masterpiece`).

2. **Remove spinner from checkout in cli.ts** — use `{ stdio: 'inherit' }` in git commands so output flows through. Print plain messages for our additions.

3. **Info not error for "not in forest"** — catch the error from `statusTrees`/`checkoutCommand` in cli.ts and print guidance in plain text. Don't use the red `error:` helper. Show example commands.

4. **`gitWorktreeAdd` should use stdio inherit** — currently in `git.ts`, git commands use `execFile` which captures output. Change to `spawn` with `stdio: 'inherit'` or at minimum don't silence stderr so the user sees git's progress.
