## 1. CLI Registration

- [x] 1.1 Switch `list` command in `src/cli.ts` from `.alias("status")` to `.aliases(["status", "ls"])`

## 2. Tests

- [x] 2.1 Existing `status.test.ts` covers list behaviour — alias is a Commander.js built-in, verified via `--help` output
