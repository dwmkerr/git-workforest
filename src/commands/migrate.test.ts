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
  });

  describe("buildMigratePreview", () => {
    it("shows before/after with top-level entries", async () => {
      const dir = path.join(tmpDir, "previewtest");
      await fs.mkdir(dir);
      await fs.mkdir(path.join(dir, "src"));
      await fs.writeFile(path.join(dir, "README.md"), "");
      await fs.writeFile(path.join(dir, "package.json"), "");

      const preview = await buildMigratePreview(dir, "main");
      expect(preview).toContain("before:");
      expect(preview).toContain("after:");
      expect(preview).toContain("src/");
      expect(preview).toContain("README.md");
      expect(preview).toContain(".workforest.yaml");
      expect(preview).toContain("main/");
    });

    it("truncates when more than 6 entries", async () => {
      const dir = path.join(tmpDir, "manyfiles");
      await fs.mkdir(dir);
      for (let i = 0; i < 8; i++) {
        await fs.writeFile(path.join(dir, `file${i}.txt`), "");
      }

      const preview = await buildMigratePreview(dir, "main");
      expect(preview).toContain("... (8 items)");
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
