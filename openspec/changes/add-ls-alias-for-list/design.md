## Context

`src/cli.ts` registers each subcommand on a single `commander` `Command` object. The `list` command currently looks like:

```ts
program
  .command("list")
  .alias("status")
  .description("list all trees in the forest (like git worktree list)")
  .action(runStatus);
```

Commander supports multiple aliases per command via repeated `.alias()` calls (or a single `.aliases([...])` call). All aliases share the same action, description, and option set, so adding `ls` is a zero-behaviour-change wiring update.

The action handler (`runStatus`) does not branch on the invoked name — it inspects `process.cwd()` only — so `ls` will produce byte-identical output to `list` and `status`.

## Goals / Non-Goals

**Goals:**

- `git forest ls` invokes the same handler as `git forest list`.
- The change is reflected in the `list-command` spec so future readers know `ls` is a supported invocation, not an accident.

**Non-Goals:**

- Introducing other shorthand aliases (`rm` for `remove`, `a` for `add`, etc.) — those would be separate changes with their own discussions.
- Changing any output, sort order, or context-detection behaviour of `list`.
- Reworking the existing `status` alias.

## Decisions

**Use a second `.alias("ls")` rather than `.aliases(["status", "ls"])`.**
Commander accepts both forms. A second `.alias()` call produces a smaller diff and matches the style of the surrounding code, which uses chained per-call configuration. Both forms are equivalent at runtime.

**Keep `status` as the primary "semantic" alias and add `ls` as a "typing" alias.**
`status` exists because the command historically showed status-style output and the alias preserves muscle memory for early users. `ls` is added purely for terseness and matches what shell users type instinctively. The spec lists both as recognised invocations without elevating either over `list`.

**Document the alias in the spec, not just the help text.**
Aliases are user-visible behaviour. `CLAUDE.md` is explicit: "A behavioural change without a spec is incomplete. New commands, flags, error messages, and output formats all go through openspec." A new accepted command name qualifies.

**Do not advertise `ls` in the `--help` examples block.**
The `examples` text in `program.addHelpText("after", ...)` shows canonical commands (`git forest list`, `git forest add`, `git forest remove`). Adding `ls` there would imply a different command rather than an alias. Commander's own help output already lists aliases next to the primary command name, which is the right surface for discovery.

## Risks / Trade-offs

- **[Risk] Alias collides with a future subcommand named `ls`** → Mitigation: there is no plan for such a command, and if one were proposed it would need its own openspec change which would surface this conflict.
- **[Risk] Users assume `ls` accepts shell-`ls`-style flags (`-l`, `-a`)** → Mitigation: `list` itself takes no flags today, so `ls` inherits the same empty option set. The help output makes this clear. If we later add flags to `list`, they apply automatically to `ls` too.
- **[Trade-off] Two aliases on one command (`status`, `ls`) is slightly more surface area** → Accepted: both serve distinct user mental models and the cost is one extra line in `cli.ts`.

## Migration Plan

None required. The change only widens accepted input; existing scripts that use `git forest list` or `git forest status` continue to work unchanged. No data migration, no config migration, no deprecation.
