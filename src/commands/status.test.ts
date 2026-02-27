import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { statusTrees, formatTreeLine } from "./status.js";

describe("status command", () => {
  const quiet = { stdio: "pipe" as const };
  let tmpDir: string;
  let repoRoot: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-status-test-"));
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

  it("returns forest root and trees", async () => {
    const { forestRoot, trees } = await statusTrees(path.join(repoRoot, "main"));
    expect(forestRoot).toBe(repoRoot);
    expect(trees).toContainEqual(
      expect.objectContaining({ name: "main" }),
    );
    expect(trees).toContainEqual(
      expect.objectContaining({ name: "fix-typo" }),
    );
  });

  it("marks the active tree when run from a branch folder", async () => {
    const { trees } = await statusTrees(path.join(repoRoot, "fix-typo"));
    const active = trees.find((t) => t.name === "fix-typo");
    const inactive = trees.find((t) => t.name === "main");
    expect(active?.active).toBe(true);
    expect(inactive?.active).toBe(false);
  });

  it("marks no tree as active when run from the forest root", async () => {
    const { trees } = await statusTrees(repoRoot);
    const anyActive = trees.some((t) => t.active);
    expect(anyActive).toBe(false);
  });

  describe("formatTreeLine", () => {
    it("shows branch and relative path", () => {
      const tree = { name: "sharpgl", branch: "main", path: "/forest/sharpgl", active: true };
      const line = formatTreeLine(tree, "/forest");
      expect(line).toBe("* main  ./sharpgl");
    });

    it("indents inactive trees", () => {
      const tree = { name: "fix-typo", branch: "fix-typo", path: "/forest/fix-typo", active: false };
      const line = formatTreeLine(tree, "/forest");
      expect(line).toBe("  fix-typo  ./fix-typo");
    });
  });

  it("throws with clone/migrate hint when outside a forest", async () => {
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), "wf-no-forest-"));
    try {
      await expect(statusTrees(outside)).rejects.toThrow(
        /not inside a workforest.*try 'git forest clone/s,
      );
    } finally {
      await fs.rm(outside, { recursive: true });
    }
  });
});
