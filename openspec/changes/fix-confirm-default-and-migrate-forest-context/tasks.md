## Tasks

### Task 1: Update `confirm()` to accept an explicit default
- File: `src/cli.ts`
- Change signature: `confirm(question: string, defaultYes: boolean): Promise<boolean>`
- Empty input → returns `defaultYes`
- `y`/`yes` (case-insensitive) → `true`
- `n`/`no` (case-insensitive) → `false`
- Anything else → returns `defaultYes`

### Task 2: Update call sites
- File: `src/cli.ts`
- Clone confirmation: `confirm("clone X to Y? (Y/n) ", true)`
- Migrate confirmation (in `migrate` and `init`): `confirm("migrate to forest layout? (y/N) ", false)`

### Task 3: Add forest context handling to `migrate`
- File: `src/cli.ts`
- In the `migrate` command handler, add an `if (context === "forest")` branch before the `if (context === "repo")` branch
- Mirror what `init` does for the same case: print "already a forest" header and tree listing
- Refactor the shared output into a small helper if duplication grows

### Task 4: Tests
- Add unit tests for `confirm()` covering empty/y/n/yes/no/typo with both defaults
- Add an integration test for `migrate` from inside a forest (asserts no clone prompt, prints listing)
