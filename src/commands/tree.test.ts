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

  const quiet = { stdio: "pipe" as const };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-tree-test-"));
    repoRoot = path.join(tmpDir, "myrepo");
    mainDir = path.join(repoRoot, "main");
    const bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`, quiet);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`, quiet);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init" && git push`,
      quiet,
    );
    await fs.mkdir(repoRoot, { recursive: true });
    execSync(`git clone "${bareRepo}" "${mainDir}"`, quiet);
    await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), "");
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
    const gitDir = path.join(result.treePath, ".git");
    const stat = await fs.stat(gitDir);
    expect(stat.isDirectory()).toBe(true);
  });

  it("throws with clone/migrate hint when outside a forest", async () => {
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), "wf-no-forest-"));
    const config = { ...DEFAULT_CONFIG };
    try {
      await expect(treeCommand("some-branch", outside, config)).rejects.toThrow(
        /not inside a workforest.*try 'git forest clone/s,
      );
    } finally {
      await fs.rm(outside, { recursive: true });
    }
  });
});
