<p align="center">
  <h2 align="center"><code>🌲 git-workforest</code></h2>
  <h3 align="center">Managed worktrees with structure. Clone once, branch into folders.</h3>
  <p align="center">
    <a href="#quickstart">Quickstart</a> |
    <a href="#commands">Commands</a> |
    <a href="#configuration">Configuration</a>
  </p>
</p>

## Quickstart

Install:

```bash
npm install -g @dwmkerr/git-workforest
```

Clone a new repo:

```bash
git forest clone dwmkerr/effective-shell
# Clone dwmkerr/effective-shell to ~/repos/github/dwmkerr/effective-shell
# Continue? (Y/n)
# also: git-workforest clone, workforest clone
```

Or initialise from an existing repo:

```bash
cd ~/repos/effective-shell
git forest init
# also: git-workforest init, workforest init
```

That's it. Your repo is now a forest — each branch gets its own folder.

## How it works

Workforest organises repos into a predictable folder structure:

```
~/repos/
  github/
    dwmkerr/
      effective-shell/          # "forest" root
        .workforest.yaml        # marker file
        main/                   # default branch (worktree)
        fix-typo/               # feature branch (worktree)
        big-refactor/           # another branch
```

Branches are created as git worktrees by default, so they share the same `.git` data. Use `fatTrees: true` in config if you prefer full clones per branch.

## Commands

### `git forest clone <org/repo>`

Clone a GitHub repo into the structured forest path:

```bash
git forest clone dwmkerr/effective-shell
# Clone dwmkerr/effective-shell to ~/repos/github/dwmkerr/effective-shell
# Continue? (Y/n)
```

Shows the proposed location and asks for confirmation. Use `-y` to skip the prompt. Creates the forest root, clones into a subfolder named after the default branch, and writes a `.workforest.yaml` marker.

### `git forest tree <branch>`

Create a new worktree (or clone) for a branch:

```bash
cd ~/repos/github/dwmkerr/effective-shell/main
git forest tree fix-typo
```

Run from inside any tree in the forest. Detects the forest root automatically.

### `git forest init`

Interactive setup. Detects your current context:

- **Inside a git repo** - offers to migrate into forest layout
- **Empty directory** - prompts for `org/repo` to clone

### `git forest list`

Show all trees in the current forest:

```bash
git forest list
#   main  main  ~/repos/github/dwmkerr/effective-shell/main
#   fix-typo  fix-typo  ~/repos/github/dwmkerr/effective-shell/fix-typo
```

## Configuration

Create `~/.workforest.yaml` to customise behaviour:

```yaml
reposDir: "~/repos/[provider]/[org]/[repo]"
treeDir: "[branch]"
fatTrees: false
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `reposDir` | `~/repos/[provider]/[org]/[repo]` | Path template for cloned repos. Tokens: `[provider]`, `[org]`, `[repo]` |
| `treeDir` | `[branch]` | Subdirectory name for each tree. Token: `[branch]` |
| `fatTrees` | `false` | Use full clones instead of git worktrees |

## Developer guide

Clone and install:

```bash
git clone git@github.com:dwmkerr/git-workforest.git
cd git-workforest
npm install
```

Build and test:

```bash
npm run build
npm test
```

Run in development:

```bash
npm run dev     # watch mode for TypeScript
npx vitest      # watch mode for tests
```

## License

MIT
