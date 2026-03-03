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
  gitFatClone,
  getRepoName,
} from "./git.js";

describe("git", () => {
  let tmpDir: string;
  let bareRepo: string;

  const quiet = { stdio: "pipe" as const };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-git-test-"));
    bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`, quiet);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`, quiet);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && git config commit.gpgsign false && touch README.md && git add . && git commit -m "init" && git push`,
      quiet,
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

  describe("gitFatClone", () => {
    it("creates a full clone for a branch", async () => {
      const cloneDir = path.join(tmpDir, "for-fat");
      await gitClone(bareRepo, cloneDir);
      const fatPath = path.join(tmpDir, "fat-clone");
      await gitFatClone(cloneDir, fatPath, "fix-typo");
      const gitDir = path.join(fatPath, ".git");
      const stat = await fs.stat(gitDir);
      expect(stat.isDirectory()).toBe(true);
    });
  });

  describe("getRepoName", () => {
    it("extracts org/repo from SSH remote URL", async () => {
      const cloneDir = path.join(tmpDir, "for-reponame");
      await gitClone(bareRepo, cloneDir);
      execSync(
        `cd "${cloneDir}" && git remote set-url origin git@github.com:dwmkerr/workforest.git`,
        quiet,
      );
      const name = await getRepoName(cloneDir);
      expect(name).toBe("dwmkerr/workforest");
    });

    it("extracts org/repo from HTTPS remote URL", async () => {
      const cloneDir = path.join(tmpDir, "for-reponame-https");
      await gitClone(bareRepo, cloneDir);
      execSync(
        `cd "${cloneDir}" && git remote set-url origin https://github.com/dwmkerr/workforest.git`,
        quiet,
      );
      const name = await getRepoName(cloneDir);
      expect(name).toBe("dwmkerr/workforest");
    });

    it("falls back to directory name when no remote", async () => {
      const noRemoteDir = path.join(tmpDir, "my-project");
      execSync(`git init "${noRemoteDir}"`, quiet);
      const name = await getRepoName(noRemoteDir);
      expect(name).toBe("my-project");
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
