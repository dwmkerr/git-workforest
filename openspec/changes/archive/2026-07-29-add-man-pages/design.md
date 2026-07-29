## Context

The package exposes three executable names backed by one Commander program. npm supports installing sectioned manual files from the `man` package field, and the active npm prefix is already part of the normal Unix manual search path. See `proposal.md` and `specs/man-pages/spec.md` for motivation and required behavior.

## Goals / Non-Goals

**Goals:**

- Keep CLI help and manual-page command reference derived from one command model.
- Make local development and npm packing reproducible without operating-system-specific generation tools.
- Support both direct executable names and Git's `git help forest` convention.

**Non-Goals:**

- Install manual pages for ephemeral `npx` executions.
- Add Windows manual-page behavior.
- Replace Commander's existing terminal help or maintain independent prose for every command.
- Introduce a general-purpose roff generation dependency.

## Decisions

### Render section 1 roff directly from the Commander model

Add a small TypeScript renderer that accepts the exported Commander program and emits the conventional NAME, SYNOPSIS, DESCRIPTION, OPTIONS, COMMANDS, EXAMPLES, and SEE ALSO sections. The generator imports the compiled CLI with parsing disabled and writes deterministic output.

This avoids duplicating command metadata and avoids external tools such as `help2man`, `ronn`, or `marked-man`. Those alternatives either add a platform dependency, introduce a development dependency for a limited format, or require a separate Markdown command reference that can drift.

### Ship one canonical page and two roff aliases

`man/workforest.1` contains the generated reference. `man/git-forest.1` and `man/git-workforest.1` use the standard roff `.so man1/workforest.1` redirect. All three filenames are declared in the npm `man` array so npm links them into the section 1 manual directory.

Duplicating the full page three times was rejected because it increases package size and creates multiple generated artifacts that could diverge.

### Check generated files into source control and verify exact equality

Generated pages remain reviewable in pull requests. A Vitest test renders from the in-memory Commander program and compares exact bytes with the checked-in files. This makes command metadata drift fail the existing CI test suite without coupling generated files to Release Please version bumps.

Keeping pages only as build artifacts was rejected because release contents would be harder to review and local source installs could depend on lifecycle behavior.

### Regenerate during npm prepack

An npm script builds the TypeScript sources and runs the generator. The `prepack` lifecycle invokes that script, ensuring `npm pack` and `npm publish` select fresh manual pages even if a developer did not run the generator manually.

## Risks / Trade-offs

- **The small roff renderer supports only Workforest's current Commander metadata** → Keep it intentionally scoped and cover all emitted sections with snapshot-like equality tests.
- **Alias pages depend on standard `.so` resolution** → Validate each installed alias with the host `man` implementation during packaging verification.
- **npm only installs manual pages for global Unix-style installations** → Document this platform boundary; command help remains available everywhere with `--help`.
- **Prepack builds twice in the current release workflow** → Accept the small redundant build to keep standalone `npm pack` safe and self-contained.

## Migration Plan

1. Publish the package through the existing Release Please workflow.
2. Verify the release tarball contains all three section 1 pages.
3. Globally install the release and smoke-test `man workforest`, both aliases, and `git help forest`.

Rollback requires publishing a follow-up version that removes the npm `man` metadata; no user configuration or data migration is involved.
