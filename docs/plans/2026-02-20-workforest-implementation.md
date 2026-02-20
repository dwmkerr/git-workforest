# workforest Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the `workforest` CLI — a TypeScript tool for managing git repos with structured worktrees/clones per branch.

**Architecture:** TypeScript ESM CLI using commander for commands, zod for config validation, and child_process for git operations. Config lives at `~/.workforest.yaml`. Each command is a separate module under `src/commands/`.

**Tech Stack:** TypeScript, commander, chalk, ora, yaml, zod, vitest

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `bin/git-workforest.js`
- Create: `src/cli.ts`
- Create: `src/index.ts`

**Step 1: Create `package.json`**

```json
{
  "name": "workforest",
  "version": "0.1.0",
  "description": "Managed worktrees with structure. Clone once, branch into folders.",
  "type": "module",
  "bin": {
    "git-workforest": "./bin/git-workforest.js"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "bin",
    "!dist/**/*.test.js",
    "!dist/**/*.map"
  ],
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "chalk": "^5.5.0",
    "commander": "^14.0.0",
    "ora": "^8.2.0",
    "yaml": "^2.8.2",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.9.0",
    "vitest": "^3.2.0"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/dwmkerr/git-workforest"
  },
  "keywords": [
    "git",
    "worktree",
    "workforest",
    "cli"
  ]
}
```

**Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

**Step 4: Create `bin/git-workforest.js`**

```javascript
#!/usr/bin/env node

import '../dist/cli.js';
```

**Step 5: Create `src/cli.ts`**

Minimal commander setup with version and description, no commands yet:

```typescript
import { Command } from "commander";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const program = new Command();

program
  .name("git-workforest")
  .description(
    "Managed worktrees with structure. Clone once, branch into folders.",
  )
  .version(version);

program.parse();
```

**Step 6: Create `src/index.ts`**

```typescript
export { loadConfig, type WorkforestConfig } from "./config.js";
```

(Will be populated as modules are built.)

**Step 7: Install dependencies and verify build**

Run: `npm install && npm run build`
Expected: Clean build, `dist/` created

**Step 8: Verify CLI runs**

Run: `node bin/git-workforest.js --version`
Expected: `0.1.0`

**Step 9: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts bin/ src/cli.ts src/index.ts
git commit -m "feat: scaffold workforest CLI project"
```

---

### Task 2: Config Module

**Files:**
- Create: `src/config.ts`
- Create: `src/config.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadConfig, DEFAULT_CONFIG, type WorkforestConfig } from "./config.js";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

describe("config", () => {
  const configPath = path.join(os.homedir(), ".workforest.yaml");

  describe("DEFAULT_CONFIG", () => {
    it("has sensible defaults", () => {
      expect(DEFAULT_CONFIG.reposDir).toBe("~/repos/[provider]/[org]/[repo]");
      expect(DEFAULT_CONFIG.treeDir).toBe("[branch]");
      expect(DEFAULT_CONFIG.fatTrees).toBe(false);
    });
  });

  describe("loadConfig", () => {
    it("returns defaults when no config file exists", async () => {
      const config = await loadConfig("/nonexistent/.workforest.yaml");
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it("merges partial config with defaults", async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-test-"));
      const tmpConfig = path.join(tmpDir, ".workforest.yaml");
      await fs.writeFile(tmpConfig, "fatTrees: true\n");

      const config = await loadConfig(tmpConfig);
      expect(config.fatTrees).toBe(true);
      expect(config.reposDir).toBe("~/repos/[provider]/[org]/[repo]");
      expect(config.treeDir).toBe("[branch]");

      await fs.rm(tmpDir, { recursive: true });
    });

    it("rejects invalid config values", async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-test-"));
      const tmpConfig = path.join(tmpDir, ".workforest.yaml");
      await fs.writeFile(tmpConfig, "fatTrees: 'not-a-boolean'\n");

      await expect(loadConfig(tmpConfig)).rejects.toThrow();

      await fs.rm(tmpDir, { recursive: true });
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/config.test.ts`
Expected: FAIL — module not found

**Step 3: Write `src/config.ts`**

```typescript
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const ConfigSchema = z.object({
  reposDir: z.string().default("~/repos/[provider]/[org]/[repo]"),
  treeDir: z.string().default("[branch]"),
  fatTrees: z.boolean().default(false),
});

export type WorkforestConfig = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: WorkforestConfig = {
  reposDir: "~/repos/[provider]/[org]/[repo]",
  treeDir: "[branch]",
  fatTrees: false,
};

export async function loadConfig(
  configPath?: string,
): Promise<WorkforestConfig> {
  const resolvedPath =
    configPath ?? path.join(os.homedir(), ".workforest.yaml");

  let raw: Record<string, unknown> = {};
  try {
    const content = await fs.readFile(resolvedPath, "utf-8");
    raw = parseYaml(content) ?? {};
  } catch {
    return DEFAULT_CONFIG;
  }

  return ConfigSchema.parse(raw);
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/config.test.ts`
Expected: All 3 tests PASS

**Step 5: Commit**

```bash
git add src/config.ts src/config.test.ts
git commit -m "feat: add config module with yaml loading and validation"
```

---

### Task 3: Path Resolution Module

**Files:**
- Create: `src/paths.ts`
- Create: `src/paths.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { resolveRepoPath, resolveTreePath } from "./paths.js";

describe("paths", () => {
  describe("resolveRepoPath", () => {
    it("resolves default pattern with github org/repo", () => {
      const result = resolveRepoPath("~/repos/[provider]/[org]/[repo]", {
        provider: "github",
        org: "dwmkerr",
        repo: "effective-shell",
      });
      expect(result).toMatch(/\/repos\/github\/dwmkerr\/effective-shell$/);
    });

    it("expands ~ to home directory", () => {
      const result = resolveRepoPath("~/repos/[provider]/[org]/[repo]", {
        provider: "github",
        org: "dwmkerr",
        repo: "effective-shell",
      });
      expect(result.startsWith("/")).toBe(true);
      expect(result).not.toContain("~");
    });

    it("handles custom patterns", () => {
      const result = resolveRepoPath("/code/[org]/[repo]", {
        provider: "github",
        org: "dwmkerr",
        repo: "effective-shell",
      });
      expect(result).toBe("/code/dwmkerr/effective-shell");
    });
  });

  describe("resolveTreePath", () => {
    it("resolves branch name to tree path", () => {
      const result = resolveTreePath(
        "/repos/github/dwmkerr/effective-shell",
        "[branch]",
        "fix-typo",
      );
      expect(result).toBe(
        "/repos/github/dwmkerr/effective-shell/fix-typo",
      );
    });

    it("handles slash-separated branch names", () => {
      const result = resolveTreePath(
        "/repos/github/dwmkerr/effective-shell",
        "[branch]",
        "feature/auth",
      );
      expect(result).toBe(
        "/repos/github/dwmkerr/effective-shell/feature/auth",
      );
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/paths.test.ts`
Expected: FAIL — module not found

**Step 3: Write `src/paths.ts`**

```typescript
import os from "os";
import path from "path";

export interface RepoTokens {
  provider: string;
  org: string;
  repo: string;
}

export function resolveRepoPath(
  pattern: string,
  tokens: RepoTokens,
): string {
  let resolved = pattern
    .replace("[provider]", tokens.provider)
    .replace("[org]", tokens.org)
    .replace("[repo]", tokens.repo);

  if (resolved.startsWith("~")) {
    resolved = path.join(os.homedir(), resolved.slice(1));
  }

  return resolved;
}

export function resolveTreePath(
  repoRoot: string,
  treePattern: string,
  branch: string,
): string {
  const treeDir = treePattern.replace("[branch]", branch);
  return path.join(repoRoot, treeDir);
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/paths.test.ts`
Expected: All 5 tests PASS

**Step 5: Commit**

```bash
git add src/paths.ts src/paths.test.ts
git commit -m "feat: add path resolution module for repo and tree patterns"
```

---

### Task 4: Git Operations Module

**Files:**
- Create: `src/git.ts`
- Create: `src/git.test.ts`

**Step 1: Write the failing test**

Tests use real git repos in tmp dirs:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import {
  gitClone,
  gitWorktreeAdd,
  getDefaultBranch,
  isInsideWorktree,
  getRepoRoot,
} from "./git.js";

describe("git", () => {
  let tmpDir: string;
  let bareRepo: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-git-test-"));
    // Create a bare repo to clone from
    bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`);
    // Create an initial commit via a temp clone
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init" && git push`,
    );
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  describe("gitClone", () => {
    it("clones a repo to target directory", async () => {
      const target = path.join(tmpDir, "cloned");
      await gitClone(bareRepo, target);
      const gitDir = path.join(target, ".git");
      const stat = await fs.stat(gitDir);
      expect(stat.isDirectory()).toBe(true);
    });
  });

  describe("getDefaultBranch", () => {
    it("detects the default branch", async () => {
      const cloneDir = path.join(tmpDir, "for-branch");
      await gitClone(bareRepo, cloneDir);
      const branch = await getDefaultBranch(cloneDir);
      expect(["main", "master"]).toContain(branch);
    });
  });

  describe("gitWorktreeAdd", () => {
    it("creates a worktree for a new branch", async () => {
      const cloneDir = path.join(tmpDir, "for-worktree");
      await gitClone(bareRepo, cloneDir);
      const treePath = path.join(tmpDir, "tree-fix");
      await gitWorktreeAdd(cloneDir, treePath, "fix-typo");
      const stat = await fs.stat(treePath);
      expect(stat.isDirectory()).toBe(true);
    });
  });

  describe("isInsideWorktree", () => {
    it("returns true inside a git repo", async () => {
      const cloneDir = path.join(tmpDir, "for-check");
      await gitClone(bareRepo, cloneDir);
      expect(await isInsideWorktree(cloneDir)).toBe(true);
    });

    it("returns false outside a git repo", async () => {
      expect(await isInsideWorktree(tmpDir)).toBe(false);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/git.test.ts`
Expected: FAIL — module not found

**Step 3: Write `src/git.ts`**

```typescript
import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

export async function gitClone(
  repoUrl: string,
  targetDir: string,
): Promise<void> {
  await exec("git", ["clone", repoUrl, targetDir]);
}

export async function getDefaultBranch(repoDir: string): Promise<string> {
  const { stdout } = await exec(
    "git",
    ["symbolic-ref", "refs/remotes/origin/HEAD", "--short"],
    { cwd: repoDir },
  );
  // "origin/main" → "main"
  return stdout.trim().replace("origin/", "");
}

export async function gitWorktreeAdd(
  repoDir: string,
  treePath: string,
  branch: string,
): Promise<void> {
  await exec("git", ["worktree", "add", "-b", branch, treePath, "HEAD"], {
    cwd: repoDir,
  });
}

export async function isInsideWorktree(dir: string): Promise<boolean> {
  try {
    await exec("git", ["rev-parse", "--is-inside-work-tree"], { cwd: dir });
    return true;
  } catch {
    return false;
  }
}

export async function getRepoRoot(dir: string): Promise<string> {
  const { stdout } = await exec(
    "git",
    ["rev-parse", "--show-toplevel"],
    { cwd: dir },
  );
  return stdout.trim();
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/git.test.ts`
Expected: All 5 tests PASS

**Step 5: Commit**

```bash
git add src/git.ts src/git.test.ts
git commit -m "feat: add git operations module (clone, worktree, branch detection)"
```

---

### Task 5: Clone Command

**Files:**
- Create: `src/commands/clone.ts`
- Create: `src/commands/clone.test.ts`
- Modify: `src/cli.ts` — register clone command

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { cloneCommand } from "./clone.js";
import { DEFAULT_CONFIG } from "../config.js";

describe("clone command", () => {
  let tmpDir: string;
  let bareRepo: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-clone-test-"));
    bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init" && git push`,
    );
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("clones into the structured path with default branch subfolder", async () => {
    const config = {
      ...DEFAULT_CONFIG,
      reposDir: path.join(tmpDir, "repos/[provider]/[org]/[repo]"),
    };
    // Use the bare repo path as the "clone URL"
    const result = await cloneCommand(bareRepo, "dwmkerr", "myrepo", config);
    const mainDir = path.join(
      tmpDir,
      "repos/github/dwmkerr/myrepo/main",
    );
    // The result should be the path to the default branch tree
    expect(result.treePath).toContain("myrepo");
    const stat = await fs.stat(result.treePath);
    expect(stat.isDirectory()).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/commands/clone.test.ts`
Expected: FAIL — module not found

**Step 3: Write `src/commands/clone.ts`**

```typescript
import path from "path";
import { promises as fs } from "fs";
import { resolveRepoPath } from "../paths.js";
import { gitClone, getDefaultBranch } from "../git.js";
import type { WorkforestConfig } from "../config.js";

export interface CloneResult {
  repoRoot: string;
  treePath: string;
  branch: string;
}

export async function cloneCommand(
  repoUrl: string,
  org: string,
  repo: string,
  config: WorkforestConfig,
): Promise<CloneResult> {
  const repoRoot = resolveRepoPath(config.reposDir, {
    provider: "github",
    org,
    repo,
  });

  // Clone to a temporary location to detect default branch
  const tmpClone = `${repoRoot}/.wf-clone-tmp`;
  await fs.mkdir(repoRoot, { recursive: true });
  await gitClone(repoUrl, tmpClone);

  const defaultBranch = await getDefaultBranch(tmpClone);
  const treePath = path.join(repoRoot, defaultBranch);

  // Move temp clone to the branch directory
  await fs.rename(tmpClone, treePath);

  return { repoRoot, treePath, branch: defaultBranch };
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/commands/clone.test.ts`
Expected: PASS

**Step 5: Wire into CLI**

Add the clone command to `src/cli.ts`:

```typescript
// Add import at top
import { cloneCommand } from "./commands/clone.js";
import { loadConfig } from "./config.js";
import ora from "ora";

// Add command before program.parse()
program
  .command("clone <repo>")
  .description("Clone a GitHub repo into the structured forest path")
  .action(async (repo: string) => {
    const spinner = ora();
    try {
      const config = await loadConfig();
      const parts = repo.split("/");
      if (parts.length !== 2) {
        throw new Error('Expected format: org/repo (e.g. dwmkerr/effective-shell)');
      }
      const [org, repoName] = parts;
      const repoUrl = `git@github.com:${org}/${repoName}`;
      spinner.start(`Cloning ${org}/${repoName}...`);
      const result = await cloneCommand(repoUrl, org, repoName, config);
      spinner.succeed(`Cloned to ${result.treePath}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      spinner.fail(message);
      process.exit(1);
    }
  });
```

**Step 6: Build and verify CLI**

Run: `npm run build && node bin/git-workforest.js clone --help`
Expected: Shows help for clone command

**Step 7: Commit**

```bash
git add src/commands/clone.ts src/commands/clone.test.ts src/cli.ts
git commit -m "feat: add clone command"
```

---

### Task 6: Tree Command

**Files:**
- Create: `src/commands/tree.ts`
- Create: `src/commands/tree.test.ts`
- Modify: `src/cli.ts` — register tree command
- Modify: `src/git.ts` — add worktree for existing branch support

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { treeCommand } from "./tree.js";
import { DEFAULT_CONFIG } from "../config.js";

describe("tree command", () => {
  let tmpDir: string;
  let repoRoot: string;
  let mainDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-tree-test-"));
    // Simulate a forest: repo root with main/ clone
    repoRoot = path.join(tmpDir, "myrepo");
    mainDir = path.join(repoRoot, "main");
    const bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init" && git push`,
    );
    await fs.mkdir(repoRoot, { recursive: true });
    execSync(`git clone "${bareRepo}" "${mainDir}"`);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("creates a worktree for a new branch", async () => {
    const config = { ...DEFAULT_CONFIG };
    const result = await treeCommand("fix-typo", mainDir, config);
    expect(result.treePath).toBe(path.join(repoRoot, "fix-typo"));
    const stat = await fs.stat(result.treePath);
    expect(stat.isDirectory()).toBe(true);
  });

  it("uses fat clone when fatTrees is true", async () => {
    const config = { ...DEFAULT_CONFIG, fatTrees: true };
    const result = await treeCommand("fix-typo", mainDir, config);
    expect(result.treePath).toBe(path.join(repoRoot, "fix-typo"));
    // Fat clone should have its own .git directory
    const gitDir = path.join(result.treePath, ".git");
    const stat = await fs.stat(gitDir);
    expect(stat.isDirectory()).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/commands/tree.test.ts`
Expected: FAIL — module not found

**Step 3: Add `gitFatClone` to `src/git.ts`**

Append to `src/git.ts`:

```typescript
export async function gitFatClone(
  sourceDir: string,
  targetDir: string,
  branch: string,
): Promise<void> {
  const { stdout } = await exec("git", ["remote", "get-url", "origin"], {
    cwd: sourceDir,
  });
  const originUrl = stdout.trim();
  await exec("git", ["clone", "-b", branch, originUrl, targetDir]);
}

export async function branchExistsOnRemote(
  repoDir: string,
  branch: string,
): Promise<boolean> {
  try {
    await exec("git", ["ls-remote", "--exit-code", "--heads", "origin", branch], {
      cwd: repoDir,
    });
    return true;
  } catch {
    return false;
  }
}
```

**Step 4: Write `src/commands/tree.ts`**

```typescript
import path from "path";
import {
  gitWorktreeAdd,
  gitFatClone,
  getRepoRoot,
  branchExistsOnRemote,
} from "../git.js";
import type { WorkforestConfig } from "../config.js";
import { resolveTreePath } from "../paths.js";

export interface TreeResult {
  treePath: string;
  branch: string;
}

export async function treeCommand(
  branch: string,
  cwd: string,
  config: WorkforestConfig,
): Promise<TreeResult> {
  const gitRoot = await getRepoRoot(cwd);
  // The repo root is the parent of the git working tree
  const repoRoot = path.dirname(gitRoot);
  const treePath = resolveTreePath(repoRoot, config.treeDir, branch);

  if (config.fatTrees) {
    const remoteExists = await branchExistsOnRemote(gitRoot, branch);
    if (remoteExists) {
      await gitFatClone(gitRoot, treePath, branch);
    } else {
      await gitFatClone(gitRoot, treePath, "HEAD");
      // TODO: create and checkout new branch
    }
  } else {
    await gitWorktreeAdd(gitRoot, treePath, branch);
  }

  return { treePath, branch };
}
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/commands/tree.test.ts`
Expected: Both tests PASS

**Step 6: Wire into CLI**

Add to `src/cli.ts` before `program.parse()`:

```typescript
import { treeCommand } from "./commands/tree.js";

program
  .command("tree <branch>")
  .description("Create a new tree (worktree or clone) for a branch")
  .action(async (branch: string) => {
    const spinner = ora();
    try {
      const config = await loadConfig();
      spinner.start(`Creating tree for ${branch}...`);
      const result = await treeCommand(branch, process.cwd(), config);
      spinner.succeed(`Tree created at ${result.treePath}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      spinner.fail(message);
      process.exit(1);
    }
  });
```

**Step 7: Build and verify**

Run: `npm run build && node bin/git-workforest.js tree --help`
Expected: Shows help for tree command

**Step 8: Commit**

```bash
git add src/commands/tree.ts src/commands/tree.test.ts src/git.ts src/cli.ts
git commit -m "feat: add tree command (worktree and fat clone modes)"
```

---

### Task 7: List Command

**Files:**
- Create: `src/commands/list.ts`
- Create: `src/commands/list.test.ts`
- Modify: `src/cli.ts` — register list command

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { listTrees } from "./list.js";

describe("list command", () => {
  let tmpDir: string;
  let repoRoot: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-list-test-"));
    repoRoot = path.join(tmpDir, "myrepo");
    const bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init" && git push`,
    );
    await fs.mkdir(repoRoot, { recursive: true });
    execSync(`git clone "${bareRepo}" "${path.join(repoRoot, "main")}"`);
    // Add a worktree
    execSync(
      `cd "${path.join(repoRoot, "main")}" && git worktree add -b fix-typo "${path.join(repoRoot, "fix-typo")}" HEAD`,
    );
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("lists all trees in the repo root", async () => {
    const trees = await listTrees(path.join(repoRoot, "main"));
    expect(trees).toContainEqual(
      expect.objectContaining({ name: "main" }),
    );
    expect(trees).toContainEqual(
      expect.objectContaining({ name: "fix-typo" }),
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/commands/list.test.ts`
Expected: FAIL — module not found

**Step 3: Write `src/commands/list.ts`**

```typescript
import { promises as fs } from "fs";
import path from "path";
import { getRepoRoot } from "../git.js";
import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

export interface TreeEntry {
  name: string;
  path: string;
  branch: string;
}

export async function listTrees(cwd: string): Promise<TreeEntry[]> {
  const gitRoot = await getRepoRoot(cwd);
  const repoRoot = path.dirname(gitRoot);

  const entries = await fs.readdir(repoRoot, { withFileTypes: true });
  const trees: TreeEntry[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const entryPath = path.join(repoRoot, entry.name);
    try {
      const { stdout } = await exec(
        "git",
        ["branch", "--show-current"],
        { cwd: entryPath },
      );
      trees.push({
        name: entry.name,
        path: entryPath,
        branch: stdout.trim(),
      });
    } catch {
      // Not a git directory, skip
    }
  }

  return trees;
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/commands/list.test.ts`
Expected: PASS

**Step 5: Wire into CLI**

Add to `src/cli.ts`:

```typescript
import { listTrees } from "./commands/list.js";
import chalk from "chalk";

program
  .command("list")
  .description("Show trees for the current repo")
  .action(async () => {
    try {
      const trees = await listTrees(process.cwd());
      if (trees.length === 0) {
        console.log("No trees found.");
        return;
      }
      for (const tree of trees) {
        console.log(`  ${chalk.green(tree.name)}  ${chalk.dim(tree.branch)}  ${chalk.dim(tree.path)}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    }
  });
```

**Step 6: Commit**

```bash
git add src/commands/list.ts src/commands/list.test.ts src/cli.ts
git commit -m "feat: add list command to show trees for current repo"
```

---

### Task 8: Info Command

**Files:**
- Create: `src/commands/info.ts`
- Create: `src/commands/info.test.ts`
- Modify: `src/cli.ts` — register info command

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { getForestInfo } from "./info.js";

describe("info command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-info-test-"));
    const bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init" && git push`,
    );
    const repoRoot = path.join(tmpDir, "myrepo");
    await fs.mkdir(repoRoot, { recursive: true });
    execSync(`git clone "${bareRepo}" "${path.join(repoRoot, "main")}"`);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("returns repo and tree info", async () => {
    const mainDir = path.join(tmpDir, "myrepo", "main");
    const info = await getForestInfo(mainDir);
    expect(info.repo).toBe("myrepo");
    expect(info.tree).toBe("main");
    expect(info.branch).toMatch(/^(main|master)$/);
  });

  it("returns null when not in a forest", async () => {
    const info = await getForestInfo(tmpDir);
    expect(info).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/commands/info.test.ts`
Expected: FAIL — module not found

**Step 3: Write `src/commands/info.ts`**

```typescript
import path from "path";
import { getRepoRoot, isInsideWorktree } from "../git.js";
import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

export interface ForestInfo {
  repo: string;
  tree: string;
  branch: string;
  repoRoot: string;
  treePath: string;
}

export async function getForestInfo(
  cwd: string,
): Promise<ForestInfo | null> {
  if (!(await isInsideWorktree(cwd))) return null;

  try {
    const gitRoot = await getRepoRoot(cwd);
    const repoRoot = path.dirname(gitRoot);
    const repo = path.basename(repoRoot);
    const tree = path.basename(gitRoot);

    const { stdout } = await exec("git", ["branch", "--show-current"], {
      cwd: gitRoot,
    });

    return {
      repo,
      tree,
      branch: stdout.trim(),
      repoRoot,
      treePath: gitRoot,
    };
  } catch {
    return null;
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/commands/info.test.ts`
Expected: Both tests PASS

**Step 5: Wire into CLI**

Add to `src/cli.ts`:

```typescript
import { getForestInfo } from "./commands/info.js";

program
  .command("info")
  .description("Show current repo and tree context")
  .option("--json", "Output as JSON")
  .action(async (options: { json?: boolean }) => {
    try {
      const info = await getForestInfo(process.cwd());
      if (!info) {
        console.error("Not inside a workforest tree.");
        process.exit(1);
      }
      if (options.json) {
        console.log(JSON.stringify(info));
      } else {
        console.log(`${info.repo}:${info.tree}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    }
  });
```

**Step 6: Commit**

```bash
git add src/commands/info.ts src/commands/info.test.ts src/cli.ts
git commit -m "feat: add info command for repo/tree context"
```

---

### Task 9: Init Command (Migrate Existing Repo)

**Files:**
- Create: `src/commands/init.ts`
- Create: `src/commands/init.test.ts`
- Modify: `src/cli.ts` — register init command

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { initCommand } from "./init.js";

describe("init command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-init-test-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("migrates an existing repo into forest layout", async () => {
    // Create a normal git repo at tmpDir/myrepo
    const repoDir = path.join(tmpDir, "myrepo");
    execSync(`git init "${repoDir}"`);
    execSync(
      `cd "${repoDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init"`,
    );

    const result = await initCommand(repoDir);
    // After init, the repo should be at myrepo/main/
    expect(result.treePath).toBe(path.join(repoDir, "main"));
    const gitDir = path.join(result.treePath, ".git");
    const stat = await fs.stat(gitDir);
    expect(stat.isDirectory()).toBe(true);
    // Original root should still exist as the parent
    const rootStat = await fs.stat(repoDir);
    expect(rootStat.isDirectory()).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/commands/init.test.ts`
Expected: FAIL — module not found

**Step 3: Write `src/commands/init.ts`**

```typescript
import path from "path";
import { promises as fs } from "fs";
import { getDefaultBranch, getRepoRoot } from "../git.js";

export interface InitResult {
  repoRoot: string;
  treePath: string;
  branch: string;
}

export async function initCommand(cwd: string): Promise<InitResult> {
  const gitRoot = await getRepoRoot(cwd);

  let branch: string;
  try {
    branch = await getDefaultBranch(gitRoot);
  } catch {
    // No remote, detect from local HEAD
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const exec = promisify(execFile);
    const { stdout } = await exec("git", ["branch", "--show-current"], {
      cwd: gitRoot,
    });
    branch = stdout.trim() || "main";
  }

  const repoRoot = gitRoot;
  const tmpName = `.wf-migrate-tmp-${Date.now()}`;
  const tmpPath = path.join(path.dirname(repoRoot), tmpName);
  const treePath = path.join(repoRoot, branch);

  // Move repo contents to temp location
  await fs.rename(repoRoot, tmpPath);
  // Recreate the repo root directory
  await fs.mkdir(repoRoot, { recursive: true });
  // Move the clone into the branch subfolder
  await fs.rename(tmpPath, treePath);

  return { repoRoot, treePath, branch };
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/commands/init.test.ts`
Expected: PASS

**Step 5: Wire into CLI**

Add to `src/cli.ts`:

```typescript
import { initCommand } from "./commands/init.js";

program
  .command("init")
  .description("Migrate the current repo into a forest layout")
  .action(async () => {
    const spinner = ora();
    try {
      spinner.start("Migrating repo to forest layout...");
      const result = await initCommand(process.cwd());
      spinner.succeed(
        `Migrated to forest layout. Main tree at ${result.treePath}`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      spinner.fail(message);
      process.exit(1);
    }
  });
```

**Step 6: Commit**

```bash
git add src/commands/init.ts src/commands/init.test.ts src/cli.ts
git commit -m "feat: add init command to migrate existing repos"
```

---

### Task 10: Install Script

**Files:**
- Create: `install.sh`

**Step 1: Write `install.sh`**

```bash
#!/bin/sh
set -e

echo "Installing workforest..."

# Check for npm
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required. Install Node.js first: https://nodejs.org"
  exit 1
fi

# Install the package globally
npm install -g workforest

# Set up the git alias
git config --global alias.forest workforest

echo ""
echo "workforest installed successfully!"
echo ""
echo "  git workforest clone <org/repo>   Full command"
echo "  git forest clone <org/repo>       Short alias"
echo ""
```

**Step 2: Verify it's valid shell**

Run: `bash -n install.sh`
Expected: No errors

**Step 3: Commit**

```bash
git add install.sh
git commit -m "feat: add curl|sh installer script"
```

---

### Task 11: README

**Files:**
- Create: `README.md`

**Step 1: Write `README.md`**

Following the established dwmkerr pattern (centered header, hero section, quickstart first):

```markdown
<p align="center">
  <h2 align="center"><code>🌲 git-workforest</code></h2>
  <h3 align="center">Managed worktrees with structure. Clone once, branch into folders.</h3>
  <p align="center">
    <a href="#quickstart">Quickstart</a> |
    <a href="#commands">Commands</a> |
    <a href="#configuration">Configuration</a> |
    <a href="#how-it-works">How It Works</a> |
    <a href="#developer-guide">Developer Guide</a>
  </p>
</p>

## Quickstart

Install:

\```bash
curl -fsSL https://raw.githubusercontent.com/dwmkerr/git-workforest/main/install.sh | sh
\```

Or manually:

\```bash
npm install -g workforest
git config --global alias.forest workforest
\```

Clone a repo:

\```bash
git forest clone dwmkerr/effective-shell
cd ~/repos/github/dwmkerr/effective-shell/main
\```

Create a tree for a branch:

\```bash
git forest tree fix-typo
cd ../fix-typo
\```

## Commands

### `git forest clone <org/repo>`

Clones a GitHub repo into a structured path with the default branch as a subfolder.

### `git forest tree <branch>`

Creates a new tree (worktree or full clone) for a branch. Run from inside any existing tree.

### `git forest init`

Migrates an existing repo into the forest layout. Run from inside the repo.

### `git forest list`

Shows all trees for the current repo.

### `git forest info`

Shows the current repo and tree context. Useful for shell prompts.

\```bash
git forest info          # myrepo:fix-typo
git forest info --json   # {"repo":"myrepo","tree":"fix-typo",...}
\```

## Configuration

Config file: `~/.workforest.yaml`

\```yaml
# Path pattern for repo directories
# Tokens: [provider], [org], [repo]
reposDir: ~/repos/[provider]/[org]/[repo]

# Subdirectory pattern for trees
# Tokens: [branch]
treeDir: "[branch]"

# Use full clones instead of git worktrees
fatTrees: false
\```

All fields are optional with sensible defaults.

## How It Works

\```
~/repos/github/dwmkerr/effective-shell/    # repo root
├── main/                                   # default branch (full clone)
├── fix-typo/                               # worktree (or fat clone)
└── feature/auth/                           # another branch
\```

Each repo gets a directory. Each branch gets a subdirectory — either a git worktree (default, lightweight) or a full clone (`fatTrees: true`).

`git workforest` is auto-discovered by git because the binary is named `git-workforest`. The `git forest` shorthand is a git alias set by the installer.

## Developer Guide

\```bash
git clone https://github.com/dwmkerr/git-workforest
cd git-workforest
npm install
npm run build
npm test
\```

Run locally:

\```bash
node bin/git-workforest.js clone dwmkerr/effective-shell
\```
```

Note: Remove the backslash before each triple-backtick when writing the actual file (the backslashes above are escaping for this plan document).

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with quickstart, commands, and config reference"
```

---

### Task 12: Final Integration Test

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Build and verify full CLI**

Run: `npm run build && node bin/git-workforest.js --help`
Expected: Shows all 5 commands (clone, tree, init, list, info)

**Step 3: Verify types**

Run: `npm run lint`
Expected: No type errors

**Step 4: Commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address integration test findings"
```

---

### Task 13: Initialize Git Repo and Push

**Step 1: Initialize git**

```bash
cd /Users/Dave_Kerr/repos/github/dwmkerr/workforest
git init
echo "node_modules/\ndist/\n*.tgz" > .gitignore
```

**Step 2: Create initial commit with all work**

All previous task commits happen during implementation. This step is just to ensure the repo is initialized before Task 1 begins.

**Step 3: Create GitHub repo**

```bash
gh repo create dwmkerr/git-workforest --public --source=. --push
```
