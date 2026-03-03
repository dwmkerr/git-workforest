import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { checkoutCommand } from "./checkout.js";
import { DEFAULT_CONFIG } from "../config.js";

describe("checkout command", () => {
  let tmpDir: string;
  let repoRoot: string;
  let mainDir: string;

  const quiet = { stdio: "pipe" as const };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-checkout-test-"));
    repoRoot = path.join(tmpDir, "myrepo");
    mainDir = path.join(repoRoot, "main");
    const bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`, quiet);
    const seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`, quiet);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && git config commit.gpgsign false && touch README.md && git add . && git commit -m "init" && git push`,
      quiet,
    );
    await fs.mkdir(repoRoot, { recursive: true });
    execSync(`git clone "${bareRepo}" "${mainDir}"`, quiet);
    await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), "");
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  it("returns existing tree without creating a new one", async () => {
    const config = { ...DEFAULT_CONFIG };
    const branch = execSync("git branch --show-current", {
      cwd: mainDir,
      encoding: "utf-8",
    }).trim();
    const result = await checkoutCommand(branch, mainDir, config);
    expect(result.created).toBe(false);
    expect(result.treePath).toBe(mainDir);
    expect(result.branch).toBe(branch);
  });

  it("creates a new tree when branch does not exist", async () => {
    const config = { ...DEFAULT_CONFIG };
    const result = await checkoutCommand("fix-typo", mainDir, config);
    expect(result.created).toBe(true);
    expect(result.treePath).toBe(path.join(repoRoot, "fix-typo"));
    const stat = await fs.stat(result.treePath);
    expect(stat.isDirectory()).toBe(true);
  });

  it("throws when not inside a workforest", async () => {
    const randomDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-no-forest-"));
    const config = { ...DEFAULT_CONFIG };
    await expect(
      checkoutCommand("main", randomDir, config),
    ).rejects.toThrow("not inside a workforest");
    await fs.rm(randomDir, { recursive: true });
  });
});
