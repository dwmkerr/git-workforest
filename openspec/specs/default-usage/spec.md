## Purpose

Show help with usage examples when the CLI is run with no command. Displays the standard help output with practical examples so users can get started quickly.

## CLI Output

```
$ git forest
Usage: git-workforest [options] [command]

Managed worktrees with structure. Clone once, branch into folders.

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  clone <repo>        Clone a GitHub repo into the structured forest path
  checkout <branch>   check out a branch (find or create its tree)
  migrate             Migrate an existing repo to forest layout, or clone a new one
  init                Detect context and set up a forest (migrate, clone, or show status)
  status              Show trees and current branch for the forest
  help [command]      display help for command

examples:

  # set up a forest (detects context automatically)
  git forest init

  # clone a repo into a structured forest
  git forest clone dwmkerr/effective-shell

  # migrate an existing repo to forest layout
  cd ~/repos/myproject && git forest migrate

  # show forest status
  git forest status
```

## Requirements

### Requirement: naked invocation shows help with examples
When the CLI is run with no command, it SHALL display the standard help output including practical usage examples.

#### Scenario: no arguments
- **WHEN** user runs `workforest` with no arguments
- **THEN** the CLI SHALL print help output with examples showing how to clone a repo, migrate an existing one, and check status

#### Scenario: help flag still works
- **WHEN** user runs `workforest --help`
- **THEN** the CLI SHALL print the full help output with all commands and examples listed
