## MODIFIED Requirements

### Requirement: migrate shows before/after preview
The CLI SHALL show a concise tree diagram preview of the forest layout before asking for confirmation. The preview SHALL use dimmed `#` comments for annotations.

#### Scenario: preview shows before and after as tree diagram
- **WHEN** user runs `workforest migrate` inside a git repository
- **THEN** the CLI SHALL display a preview with a `# before` section showing the repo folder name, and a `# after` section showing the forest layout with `.workforest.yaml`, the main branch folder, and placeholder worktree branch folders

#### Scenario: preview uses repo directory name
- **WHEN** the preview is displayed
- **THEN** it SHALL use the actual repo directory name (e.g. `gdog/`) in both before and after sections

#### Scenario: preview uses current branch name
- **WHEN** the preview is displayed
- **THEN** it SHALL use the actual current branch name (e.g. `main/`) as the main branch folder

#### Scenario: preview shows worktree placeholders
- **WHEN** the preview is displayed
- **THEN** it SHALL show `<branch-1>/` and `<branch-2>/` as placeholder worktree folders with dimmed `# worktree` and `# etc` comments

#### Scenario: preview annotations are dimmed
- **WHEN** the preview is displayed
- **THEN** all `#` comment text SHALL be rendered with dimmed styling (chalk.dim)

#### Scenario: preview notes non-destructive change
- **WHEN** the preview is displayed
- **THEN** the CLI SHALL print `no files will be changed, folder rename only.` before the confirmation prompt

#### Scenario: preview does not list directory contents
- **WHEN** the preview is displayed
- **THEN** it SHALL NOT list individual files from the repo directory

### Requirement: migrate converts existing repo to forest layout
The CLI SHALL move repo contents into a subdirectory named after the current branch, keeping the parent directory as the forest root. The shell working directory SHALL remain valid at the forest root after migration.

#### Scenario: successful migration
- **WHEN** user confirms migration
- **THEN** a subdirectory named after the current branch SHALL be created inside the repo directory, all existing contents SHALL be moved into it, and a `.workforest.yaml` marker SHALL be created at the repo root

#### Scenario: shell working directory stays valid
- **WHEN** migration completes
- **THEN** the user's shell working directory SHALL remain at the forest root (the original repo path) without requiring a `cd` to refresh

### Requirement: migrate shows cd hint after completion
The CLI SHALL print a `cd` command after successful migration so the user knows how to enter their tree.

#### Scenario: cd hint is prominent
- **WHEN** migration completes successfully
- **THEN** the CLI SHALL print a dimmed comment line `# important: cd to your branch location now` followed by the `cd` path in bright white (chalk.whiteBright)

#### Scenario: cd hint uses relative path when possible
- **WHEN** the new tree is a child of the current directory
- **THEN** the CLI SHALL show `cd <branch>` (e.g., `cd main`) rather than the full absolute path
