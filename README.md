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
# clone dwmkerr/effective-shell to ~/repos/github/dwmkerr/effective-shell? (Y/n)
# also: git-workforest clone, workforest clone
```

Or migrate an existing repo to forest layout:

```bash
cd ~/repos/effective-shell
git forest migrate
# you can also use the aliases 'git-workforest' or 'workforest'
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
# clone dwmkerr/effective-shell to ~/repos/github/dwmkerr/effective-shell? (Y/n)
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

Detect your context and do the right thing:

- **Inside a forest** — show status and trees
- **Inside a git repo** — offer to migrate to forest layout
- **Empty directory** — suggest `git forest clone`

<img src="docs/screenshots/init.png" width="600" alt="git forest init" />

### `git forest migrate`

Migrate an existing repo to forest layout. Shows a preview, asks for confirmation, then moves your repo contents into a branch subfolder.

<img src="docs/screenshots/migrate.png" width="600" alt="git forest migrate" />

Your shell stays at the forest root. No files are modified — just a folder rename.

### `git forest status`

Show all trees in the current forest. Highlights the active branch when run from inside a tree:

```bash
cd ~/repos/github/dwmkerr/effective-shell/fix-typo
git forest status
# * fix-typo  fix-typo  ~/repos/github/dwmkerr/effective-shell/fix-typo
#   main      main      ~/repos/github/dwmkerr/effective-shell/main
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
make build
make test
```

Install globally:

```bash
make install
```

## License

MIT
