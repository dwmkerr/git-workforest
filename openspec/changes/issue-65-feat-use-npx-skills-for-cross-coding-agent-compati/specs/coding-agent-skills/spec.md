## Purpose

Defines how the workforest skill is packaged and installed into a project's coding-agent configuration so that Claude Code, GitHub Copilot (Codex), Cursor, and other agents that read project context files can understand forest layouts and use `git forest` commands.

## ADDED Requirements

### Requirement: skill installer is runnable via npx
The package SHALL expose an executable entry point so that users can install the workforest skill into their project by running `npx @dwmkerr/git-workforest skill` without a prior global install.

#### Scenario: user runs npx skill installer
- **WHEN** a user runs `npx @dwmkerr/git-workforest skill` from any directory
- **THEN** the installer SHALL write the workforest skill content to the appropriate path within the current working directory
- **AND** SHALL print a confirmation message indicating the path the skill was written to

### Requirement: skill installer writes to the claude code skill path
The installer SHALL write the skill content to `.claude/skills/workforest/SKILL.md` when the target environment is Claude Code (the default).

#### Scenario: claude code target (default)
- **WHEN** the user runs the skill installer with no `--agent` flag, or with `--agent claude`
- **THEN** the installer SHALL create `.claude/skills/workforest/SKILL.md` relative to the current working directory
- **AND** SHALL print `skill written to .claude/skills/workforest/SKILL.md`

### Requirement: skill installer writes to a generic fallback path
The installer SHALL write the skill content to `.agent/skills/workforest.md` when invoked with `--agent generic`.

#### Scenario: generic target
- **WHEN** the user runs the skill installer with `--agent generic`
- **THEN** the installer SHALL create `.agent/skills/workforest.md` relative to the current working directory
- **AND** SHALL print `skill written to .agent/skills/workforest.md`

### Requirement: README documents npx skill installation prominently
The README SHALL document the npx-based skill install method in a dedicated section that appears immediately after the Quickstart section (before Commands), so that new users see coding-agent setup instructions early.

#### Scenario: coding agent section position
- **WHEN** a user reads the README
- **THEN** the coding-agent / skills section SHALL appear before the Commands section
- **AND** SHALL show `npx @dwmkerr/git-workforest skill` as the primary install method
- **AND** SHALL retain `claude plugin add dwmkerr/git-workforest` as an alternative for Claude Code users

### Requirement: skill content is included in the published npm package
The npm package SHALL include the skill content file (`plugins/git-workforest/skills/workforest/SKILL.md`) in its published files so the installer can read it at runtime.

#### Scenario: package published with skill content
- **WHEN** the package is published to npm
- **THEN** the `plugins/` directory (or the relevant skill file) SHALL be present in the installed package
- **AND** the installer SHALL be able to read the skill content without making network requests
