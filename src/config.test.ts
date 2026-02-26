import { describe, it, expect } from "vitest";
import { loadConfig, DEFAULT_CONFIG } from "./config.js";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

describe("config", () => {
  describe("DEFAULT_CONFIG", () => {
    it("has sensible defaults", () => {
      expect(DEFAULT_CONFIG.reposDir).toBe("~/repos/[provider]/[org]/[repo]");
      expect(DEFAULT_CONFIG.treeDir).toBe("[branch]");
      expect(DEFAULT_CONFIG.fatTrees).toBe(false);
    });
  });

  describe("loadConfig", () => {
    it("returns defaults when no config file exists", async () => {
      const config = await loadConfig("/nonexistent/.workforest.yaml");
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it("merges partial config with defaults", async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-test-"));
      const tmpConfig = path.join(tmpDir, ".workforest.yaml");
      await fs.writeFile(tmpConfig, "fatTrees: true\n");

      const config = await loadConfig(tmpConfig);
      expect(config.fatTrees).toBe(true);
      expect(config.reposDir).toBe("~/repos/[provider]/[org]/[repo]");
      expect(config.treeDir).toBe("[branch]");

      await fs.rm(tmpDir, { recursive: true });
    });

    it("rejects invalid config values", async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-test-"));
      const tmpConfig = path.join(tmpDir, ".workforest.yaml");
      await fs.writeFile(tmpConfig, "fatTrees: 'not-a-boolean'\n");

      await expect(loadConfig(tmpConfig)).rejects.toThrow();

      await fs.rm(tmpDir, { recursive: true });
    });
  });
});
