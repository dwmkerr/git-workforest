import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { removeCommand } from "./remove.js";

describe("remove command", () => {
  let tmpDir: string;
  let repoRoot: string;
  let mainDir: string;

  const quiet = { stdio: "pipe" as const };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-remove-test-"));
    repoRoot = path.join(tmpDir, "myrepo");
    mainDir = path.join(repoRoot, "main");
    const bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare --initial-branch=main "${bareRepo}"`, quiet);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`, quiet);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && git config commit.gpgsign false && touch README.md && git add . && git commit -m "init" && git push`,
      quiet,
    );
    await fs.mkdir(repoRoot, { recursive: true });
    execSync(`git clone "${bareRepo}" "${mainDir}"`, quiet);
    execSync(
      `cd "${mainDir}" && git worktree add -b fix-typo "${path.join(repoRoot, "fix-typo")}" HEAD`,
      quiet,
    );
    await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), `remote: ${bareRepo}\n`);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("removes a worktree", async () => {
    const result = await removeCommand("fix-typo", mainDir);
    expect(result.branch).toBe("fix-typo");
    const exists = await fs.stat(path.join(repoRoot, "fix-typo")).catch(() => null);
    expect(exists).toBeNull();
  });

  it("refuses to remove the active tree", async () => {
    const fixDir = path.join(repoRoot, "fix-typo");
    const err = await removeCommand("fix-typo", fixDir).catch((e) => e);
    expect(err.message).toMatch("cannot remove the active tree");
    expect(err.forestRoot).toBe(repoRoot);
  });

  it("throws when tree not found", async () => {
    await expect(
      removeCommand("nonexistent", mainDir),
    ).rejects.toThrow("tree 'nonexistent' not found");
  });

  it("refuses to remove dirty tree without force", async () => {
    const fixDir = path.join(repoRoot, "fix-typo");
    await fs.writeFile(path.join(fixDir, "dirty.txt"), "uncommitted");
    await expect(
      removeCommand("fix-typo", mainDir),
    ).rejects.toThrow("uncommitted changes");
  });

  it("force-removes dirty tree", async () => {
    const fixDir = path.join(repoRoot, "fix-typo");
    await fs.writeFile(path.join(fixDir, "dirty.txt"), "uncommitted");
    const result = await removeCommand("fix-typo", mainDir, true);
    expect(result.branch).toBe("fix-typo");
    const exists = await fs.stat(fixDir).catch(() => null);
    expect(exists).toBeNull();
  });

  it("removes nested tree and cleans up empty parent dirs", async () => {
    const featDir = path.join(repoRoot, "feat");
    await fs.mkdir(featDir, { recursive: true });
    execSync(
      `cd "${mainDir}" && git worktree add -b feat/new-thing "${path.join(featDir, "new-thing")}" HEAD`,
      quiet,
    );
    const result = await removeCommand("feat/new-thing", mainDir);
    expect(result.branch).toBe("feat/new-thing");
    // The feat/ directory should be cleaned up too
    const featExists = await fs.stat(featDir).catch(() => null);
    expect(featExists).toBeNull();
  });

  it("throws when not inside a workforest", async () => {
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), "wf-no-forest-"));
    try {
      await expect(
        removeCommand("main", outside),
      ).rejects.toThrow("not inside a workforest");
    } finally {
      await fs.rm(outside, { recursive: true });
    }
  });
});
