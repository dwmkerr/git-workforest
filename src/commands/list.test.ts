import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { listTrees } from "./list.js";

describe("list command", () => {
  const quiet = { stdio: "pipe" as const };
  let tmpDir: string;
  let repoRoot: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-list-test-"));
    repoRoot = path.join(tmpDir, "myrepo");
    const bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`, quiet);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`, quiet);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init" && git push`,
      quiet,
    );
    await fs.mkdir(repoRoot, { recursive: true });
    execSync(`git clone "${bareRepo}" "${path.join(repoRoot, "main")}"`, quiet);
    execSync(
      `cd "${path.join(repoRoot, "main")}" && git worktree add -b fix-typo "${path.join(repoRoot, "fix-typo")}" HEAD`,
      quiet,
    );
    await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), "");
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("lists all trees in the forest", async () => {
    const trees = await listTrees(path.join(repoRoot, "main"));
    expect(trees).toContainEqual(
      expect.objectContaining({ name: "main" }),
    );
    expect(trees).toContainEqual(
      expect.objectContaining({ name: "fix-typo" }),
    );
  });
});
