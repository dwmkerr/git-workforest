import { describe, it, expect } from "vitest";
import { resolveRepoPath, resolveTreePath, findForestRoot } from "./paths.js";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

describe("paths", () => {
  describe("resolveRepoPath", () => {
    it("resolves default pattern with github org/repo", () => {
      const result = resolveRepoPath("~/repos/[provider]/[org]/[repo]", {
        provider: "github",
        org: "dwmkerr",
        repo: "effective-shell",
      });
      expect(result).toMatch(/\/repos\/github\/dwmkerr\/effective-shell$/);
    });

    it("expands ~ to home directory", () => {
      const result = resolveRepoPath("~/repos/[provider]/[org]/[repo]", {
        provider: "github",
        org: "dwmkerr",
        repo: "effective-shell",
      });
      expect(result.startsWith("/")).toBe(true);
      expect(result).not.toContain("~");
    });

    it("handles custom patterns", () => {
      const result = resolveRepoPath("/code/[org]/[repo]", {
        provider: "github",
        org: "dwmkerr",
        repo: "effective-shell",
      });
      expect(result).toBe("/code/dwmkerr/effective-shell");
    });
  });

  describe("resolveTreePath", () => {
    it("resolves branch name to tree path", () => {
      const result = resolveTreePath(
        "/repos/github/dwmkerr/effective-shell",
        "[branch]",
        "fix-typo",
      );
      expect(result).toBe(
        "/repos/github/dwmkerr/effective-shell/fix-typo",
      );
    });

    it("handles slash-separated branch names", () => {
      const result = resolveTreePath(
        "/repos/github/dwmkerr/effective-shell",
        "[branch]",
        "feature/auth",
      );
      expect(result).toBe(
        "/repos/github/dwmkerr/effective-shell/feature/auth",
      );
    });
  });

  describe("findForestRoot", () => {
    it("finds forest root by walking up to .workforest.yaml with remote", async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-path-test-"));
      const forestRoot = path.join(tmpDir, "myrepo");
      const treeDir = path.join(forestRoot, "main", "src", "deep");
      await fs.mkdir(treeDir, { recursive: true });
      await fs.writeFile(path.join(forestRoot, ".workforest.yaml"), "remote: git@github.com:test/repo.git\n");

      const result = await findForestRoot(treeDir);
      expect(result).toEqual({ forestRoot, remote: "git@github.com:test/repo.git" });

      await fs.rm(tmpDir, { recursive: true });
    });

    it("throws for legacy marker without remote", async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-path-test-"));
      const forestRoot = path.join(tmpDir, "myrepo");
      const treeDir = path.join(forestRoot, "main");
      await fs.mkdir(treeDir, { recursive: true });
      await fs.writeFile(path.join(forestRoot, ".workforest.yaml"), "");

      await expect(findForestRoot(treeDir)).rejects.toThrow("missing the 'remote:' key");

      await fs.rm(tmpDir, { recursive: true });
    });

    it("returns null when no marker found", async () => {
      const result = await findForestRoot(os.tmpdir());
      expect(result).toBeNull();
    });
  });
});
