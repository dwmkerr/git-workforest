import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { statusTrees, formatTreeLine, getDefaultBranch } from "./status.js";

describe("status command", () => {
  const quiet = { stdio: "pipe" as const };
  let tmpDir: string;
  let repoRoot: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-status-test-"));
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
    await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), `remote: ${bareRepo}\n`);
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
    it("shows * prefix for active tree", () => {
      const tree = { name: "sharpgl", branch: "main", path: "/forest/sharpgl", active: true, isDefault: true };
      const line = formatTreeLine(tree, "/forest");
      expect(line).toBe("* main  ./sharpgl");
    });

    it("shows + prefix for inactive non-default tree", () => {
      const tree = { name: "fix-typo", branch: "fix-typo", path: "/forest/fix-typo", active: false, isDefault: false };
      const line = formatTreeLine(tree, "/forest");
      expect(line).toBe("+ fix-typo  ./fix-typo");
    });

    it("shows blank prefix for inactive default tree", () => {
      const tree = { name: "main", branch: "main", path: "/forest/main", active: false, isDefault: true };
      const line = formatTreeLine(tree, "/forest");
      expect(line).toBe("  main  ./main");
    });
  });

  it("finds nested trees like feat/branch-name", async () => {
    const featDir = path.join(repoRoot, "feat");
    await fs.mkdir(featDir, { recursive: true });
    execSync(
      `cd "${path.join(repoRoot, "main")}" && git worktree add -b feat/new-thing "${path.join(featDir, "new-thing")}" HEAD`,
      quiet,
    );
    const { trees } = await statusTrees(path.join(repoRoot, "main"));
    const nested = trees.find((t) => t.name === "feat/new-thing");
    expect(nested).toBeDefined();
    expect(nested?.branch).toBe("feat/new-thing");
    expect(nested?.path).toBe(path.join(featDir, "new-thing"));
  });

  it("sorts trees with default branch first then alphabetically", async () => {
    const featDir = path.join(repoRoot, "feat");
    const docsDir = path.join(repoRoot, "docs");
    await fs.mkdir(featDir, { recursive: true });
    await fs.mkdir(docsDir, { recursive: true });
    execSync(
      `cd "${path.join(repoRoot, "main")}" && git worktree add -b feat/a "${path.join(featDir, "a")}" HEAD`,
      quiet,
    );
    execSync(
      `cd "${path.join(repoRoot, "main")}" && git worktree add -b docs/b "${path.join(docsDir, "b")}" HEAD`,
      quiet,
    );
    const { trees } = await statusTrees(path.join(repoRoot, "main"));
    const branches = trees.map((t) => t.branch);
    expect(branches[0]).toBe("main");
    expect(branches.slice(1)).toEqual([...branches.slice(1)].sort());
  });

  it("marks the default branch with isDefault", async () => {
    const { trees } = await statusTrees(path.join(repoRoot, "main"));
    const mainTree = trees.find((t) => t.branch === "main");
    const fixTree = trees.find((t) => t.branch === "fix-typo");
    expect(mainTree?.isDefault).toBe(true);
    expect(fixTree?.isDefault).toBe(false);
  });

  it("detects default branch via git symbolic-ref", async () => {
    const mainDir = path.join(repoRoot, "main");
    const branch = await getDefaultBranch(mainDir);
    expect(branch).toBe("main");
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
