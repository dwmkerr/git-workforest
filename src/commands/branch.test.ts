import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { branchCommand } from "./branch.js";

describe("branch command", () => {
  const quiet = { stdio: "pipe" as const };
  let tmpDir: string;
  let repoRoot: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-branch-test-"));
    repoRoot = path.join(tmpDir, "myrepo");
    const bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare --initial-branch=main "${bareRepo}"`, quiet);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`, quiet);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && git config commit.gpgsign false && touch README.md && git add . && git commit -m "init" && git push`,
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

  it("returns all branches in the forest", async () => {
    const { trees } = await branchCommand(path.join(repoRoot, "main"));
    const branches = trees.map((t) => t.branch);
    expect(branches).toContain("main");
    expect(branches).toContain("fix-typo");
  });

  it("marks the active branch when run from a tree folder", async () => {
    const { trees } = await branchCommand(path.join(repoRoot, "fix-typo"));
    const active = trees.find((t) => t.branch === "fix-typo");
    const inactive = trees.find((t) => t.branch === "main");
    expect(active?.active).toBe(true);
    expect(inactive?.active).toBe(false);
  });

  it("marks no branch as active when run from the forest root", async () => {
    const { trees } = await branchCommand(repoRoot);
    expect(trees.some((t) => t.active)).toBe(false);
  });

  it("marks the default branch with isDefault", async () => {
    const { trees } = await branchCommand(path.join(repoRoot, "main"));
    const mainTree = trees.find((t) => t.branch === "main");
    const fixTree = trees.find((t) => t.branch === "fix-typo");
    expect(mainTree?.isDefault).toBe(true);
    expect(fixTree?.isDefault).toBe(false);
  });

  it("sorts with default branch first", async () => {
    const { trees } = await branchCommand(path.join(repoRoot, "main"));
    expect(trees[0].branch).toBe("main");
  });

  it("throws with a helpful message when outside a forest", async () => {
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), "wf-no-forest-"));
    try {
      await expect(branchCommand(outside)).rejects.toThrow(
        /not inside a workforest/,
      );
    } finally {
      await fs.rm(outside, { recursive: true });
    }
  });
});
