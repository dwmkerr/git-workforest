import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { migrateToForest, detectContext } from "./init.js";

describe("init command", () => {
  const quiet = { stdio: "pipe" as const };
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-init-test-"));
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
  });

  describe("migrateToForest", () => {
    it("migrates an existing repo into forest layout", async () => {
      const repoDir = path.join(tmpDir, "myrepo");
      execSync(`git init "${repoDir}"`, quiet);
      execSync(
        `cd "${repoDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init"`,
        quiet,
      );

      const result = await migrateToForest(repoDir);
      expect(["main", "master"]).toContain(result.branch);
      const gitDir = path.join(result.treePath, ".git");
      const stat = await fs.stat(gitDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it("creates .workforest.yaml marker after migration", async () => {
      const repoDir = path.join(tmpDir, "myrepo");
      execSync(`git init "${repoDir}"`, quiet);
      execSync(
        `cd "${repoDir}" && git config user.email "test@test.com" && git config user.name "Test" && touch README.md && git add . && git commit -m "init"`,
        quiet,
      );

      const result = await migrateToForest(repoDir);
      const marker = path.join(result.repoRoot, ".workforest.yaml");
      const stat = await fs.stat(marker);
      expect(stat.isFile()).toBe(true);
    });
  });
});
