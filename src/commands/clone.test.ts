import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { cloneCommand } from "./clone.js";
import { DEFAULT_CONFIG } from "../config.js";

describe("clone command", () => {
  let tmpDir: string;
  let bareRepo: string;

  const quiet = { stdio: "pipe" as const };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-clone-test-"));
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

  it("clones into structured path with default branch subfolder", async () => {
    const config = {
      ...DEFAULT_CONFIG,
      reposDir: path.join(tmpDir, "repos/[provider]/[org]/[repo]"),
    };
    const result = await cloneCommand(bareRepo, "dwmkerr", "myrepo", config);
    expect(result.treePath).toContain("myrepo");
    const stat = await fs.stat(result.treePath);
    expect(stat.isDirectory()).toBe(true);
  });

  it("creates .workforest.yaml marker in forest root", async () => {
    const config = {
      ...DEFAULT_CONFIG,
      reposDir: path.join(tmpDir, "repos/[provider]/[org]/[repo]"),
    };
    const result = await cloneCommand(bareRepo, "dwmkerr", "myrepo", config);
    const marker = path.join(result.repoRoot, ".workforest.yaml");
    const stat = await fs.stat(marker);
    expect(stat.isFile()).toBe(true);
  });
});
