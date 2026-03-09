## ADDED Requirements

### Requirement: Each command has a consistent docs section in README

Every command in the README SHALL have: a 2-3 sentence description, then 2-3 fenced code blocks showing `$ git forest <command>` with realistic terminal output for different scenarios. Screenshots follow the code examples.

#### Scenario: clone command docs

- **WHEN** viewing the `clone` section in README
- **THEN** it shows a description and scenarios like:

```
$ git forest clone dwmkerr/effective-shell
clone dwmkerr/effective-shell to ~/repos/github/dwmkerr/effective-shell? (Y/n)
```

```
$ git forest clone dwmkerr/effective-shell -y
✔ cloned to ~/repos/github/dwmkerr/effective-shell/main
```

#### Scenario: migrate command docs

- **WHEN** viewing the `migrate` section in README
- **THEN** it shows a description and scenarios like:

```
$ git forest migrate

existing repo detected. migration preview:

  # before
  my-project/

  # after
  my-project/
    .workforest.yaml       # preferences
    main/                  # current branch
    <branch-1>/            # worktree
    <branch-2>/            # etc

no files will be changed, folder rename only.
migrate to forest layout? (y/N)
```

```
$ git forest migrate

existing repo detected. migration preview:

  # before
  ark/

  # after
  ark/
    .workforest.yaml       # preferences
    feat/model-providers/  # current branch
    main/                  # worktree
    fix/bug-123/           # worktree

no files will be changed, folder rename only.
migrate to forest layout? (y/N)
```

#### Scenario: init command docs

- **WHEN** viewing the `init` section in README
- **THEN** it shows a description and scenarios like:

```
$ git forest init
already a forest. on branch main in dwmkerr/effective-shell

trees:
* main  ./main
  fix-typo  ./fix-typo
```

```
$ git forest init
no forest found. clone one with:

  git forest clone org/repo
  git forest clone git@github.com:org/repo.git
```

#### Scenario: status command docs

- **WHEN** viewing the `status` section in README
- **THEN** it shows a description and scenarios like:

```
$ git forest status
on branch fix-typo in dwmkerr/effective-shell

trees:
  main  ./main
* fix-typo  ./fix-typo
```

```
$ git forest status
in repo my-project, not a forest yet. to migrate:

  git forest migrate
```

#### Scenario: checkout command docs

- **WHEN** viewing the `checkout` section in README
- **THEN** it shows a description and scenarios like:

```
$ git forest checkout fix-typo
checked out fix-typo.

# please change directory:
cd fix-typo
```

```
$ git forest checkout main
already on main.
```

### Requirement: Terminal screenshots for each command

Each command SHALL have a shellwright-captured PNG screenshot at `docs/screenshots/<command>.png`. The screenshot shows one representative invocation of the command.

#### Scenario: Screenshot files exist

- **WHEN** checking `docs/screenshots/`
- **THEN** files exist for: `clone.png`, `migrate.png`, `init.png`, `status.png`, `checkout.png`

### Requirement: CLAUDE.md documents the screenshot capture process

CLAUDE.md SHALL include a section describing how to capture terminal screenshots using shellwright MCP, including the prompt style, terminal size, and workflow.

#### Scenario: Screenshot instructions in CLAUDE.md

- **WHEN** reading the CLAUDE.md screenshot section
- **THEN** it describes: shellwright MCP setup, PS1 prompt (`$ ` in bright white), terminal dimensions, and the capture workflow for each command
