## Context

The workforest CLI is fully implemented but has no OpenSpec specs. This change captures existing behaviour as baseline specs so future changes can reference and modify them.

## Goals / Non-Goals

**Goals:**
- Document all existing capabilities as specs
- Enable future changes to use MODIFIED/REMOVED operations on these specs

**Non-Goals:**
- No code changes
- No new features

## Decisions

### Spec per capability, not per file
Specs are organised by capability (clone-command, config) rather than by source file (cli.ts, config.ts). This aligns specs with user-facing behaviour rather than implementation details.

### Scenarios map to existing tests
Each scenario corresponds to an existing test case, ensuring specs are grounded in verified behaviour.

## Risks / Trade-offs

- Specs may drift from implementation if code changes without updating specs — mitigated by using OpenSpec change workflow for all future modifications
