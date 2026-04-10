import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import {
  migrateToForest,
  detectContext,
  buildMigratePreview,
} from "./migrate.js";

describe("migrate command", () => {
  const quiet = { stdio: "pipe" as const };
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-migrate-test-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  describe("detectContext", () => {
    it("returns 'repo' inside a git repo", async () => {
      const repoDir = path.join(tmpDir, "myrepo");
      execSync(`git init "${repoDir}"`, quiet);
      expect(await detectContext(repoDir)).toBe("repo");
    });

    it("returns 'empty' outside a git repo", async () => {
      expect(await detectContext(tmpDir)).toBe("empty");
    });

    it("returns 'forest' when .workforest.yaml exists", async () => {
      const forestDir = path.join(tmpDir, "myforest");
      await fs.mkdir(forestDir);
      await fs.writeFile(path.join(forestDir, ".workforest.yaml"), "remote: git@github.com:test/repo.git\n");
      expect(await detectContext(forestDir)).toBe("forest");
    });
  });

  describe("buildMigratePreview", () => {
    it("shows before/after tree with current branch label", () => {
      const preview = buildMigratePreview("gdog", "main", ["main"]);
      expect(preview).toContain("# before");
      expect(preview).toContain("gdog/");
      expect(preview).toContain("# after");
      expect(preview).toContain(".workforest.yaml");
      expect(preview).toContain("main/  # current branch");
    });

    it("shows placeholders when only one branch exists", () => {
      const preview = buildMigratePreview("gdog", "main", ["main"]);
      expect(preview).toContain("<branch-1>/");
      expect(preview).toContain("<branch-2>/");
      expect(preview).toContain("# etc");
    });

    it("shows real branches as worktrees", () => {
      const preview = buildMigratePreview("ark", "feat/model-providers", [
        "feat/model-providers",
        "main",
        "fix/bug-123",
      ]);
      expect(preview).toContain("feat/model-providers/  # current branch");
      expect(preview).toContain("main/  # worktree");
      expect(preview).toContain("fix/bug-123/  # worktree");
      expect(preview).not.toContain("...");
    });

    it("shows ellipsis when more than 3 branches", () => {
      const preview = buildMigratePreview("ark", "feat/x", [
        "feat/x",
        "main",
        "fix/a",
        "fix/b",
      ]);
      expect(preview).toContain("feat/x/  # current branch");
      expect(preview).toContain("main/  # worktree");
      expect(preview).toContain("fix/a/  # worktree");
      expect(preview).not.toContain("fix/b/");
      expect(preview).toContain("...");
    });

    it("uses provided repo name and branch", () => {
      const preview = buildMigratePreview("myproject", "develop", ["develop"]);
      expect(preview).toContain("myproject/");
      expect(preview).toContain("develop/");
    });
  });

  describe("migrateToForest", () => {
    it("migrates an existing repo into forest layout", async () => {
      const repoDir = path.join(tmpDir, "myrepo");
      execSync(`git init "${repoDir}"`, quiet);
      execSync(
        `cd "${repoDir}" && git config user.email "test@test.com" && git config user.name "Test" && git config commit.gpgsign false && touch README.md && git add . && git commit -m "init" && git remote add origin git@github.com:test/repo.git`,
        quiet,
      );

      const result = await migrateToForest(repoDir);
      expect(["main", "master"]).toContain(result.branch);
      const gitDir = path.join(result.treePath, ".git");
      const stat = await fs.stat(gitDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it("handles branch names with slashes (e.g. feat/foo)", async () => {
      const repoDir = path.join(tmpDir, "slashrepo");
      execSync(`git init "${repoDir}"`, quiet);
      execSync(
        `cd "${repoDir}" && git config user.email "test@test.com" && git config user.name "Test" && git config commit.gpgsign false && touch README.md && git add . && git commit -m "init" && git remote add origin git@github.com:test/repo.git && git checkout -b feat/my-feature`,
        quiet,
      );

      const result = await migrateToForest(repoDir);
      expect(result.branch).toBe("feat/my-feature");
      const gitDir = path.join(result.treePath, ".git");
      const stat = await fs.stat(gitDir);
      expect(stat.isDirectory()).toBe(true);
      const readme = path.join(result.treePath, "README.md");
      const readmeStat = await fs.stat(readme);
      expect(readmeStat.isFile()).toBe(true);
    });

    it("creates .workforest.yaml marker with remote after migration", async () => {
      const repoDir = path.join(tmpDir, "myrepo");
      execSync(`git init "${repoDir}"`, quiet);
      execSync(
        `cd "${repoDir}" && git config user.email "test@test.com" && git config user.name "Test" && git config commit.gpgsign false && touch README.md && git add . && git commit -m "init" && git remote add origin git@github.com:test/repo.git`,
        quiet,
      );

      const result = await migrateToForest(repoDir);
      const marker = path.join(result.repoRoot, ".workforest.yaml");
      const content = await fs.readFile(marker, "utf-8");
      expect(content).toContain("remote: git@github.com:test/repo.git");
    });
  });
});
