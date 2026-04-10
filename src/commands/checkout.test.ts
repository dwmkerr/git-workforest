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
  let bareRepo: string;
  let seedDir: string;

  const quiet = { stdio: "pipe" as const };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-checkout-test-"));
    repoRoot = path.join(tmpDir, "myrepo");
    mainDir = path.join(repoRoot, "main");
    bareRepo = path.join(tmpDir, "bare.git");
    execSync(`git init --bare "${bareRepo}"`, quiet);
    seedDir = path.join(tmpDir, "seed");
    execSync(`git clone "${bareRepo}" "${seedDir}"`, quiet);
    execSync(
      `cd "${seedDir}" && git config user.email "test@test.com" && git config user.name "Test" && git config commit.gpgsign false && touch README.md && git add . && git commit -m "init" && git push`,
      quiet,
    );
    await fs.mkdir(repoRoot, { recursive: true });
    execSync(`git clone "${bareRepo}" "${mainDir}"`, quiet);
    await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), `remote: ${bareRepo}\n`);
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

  it("creates a new tree when run from the forest root", async () => {
    const config = { ...DEFAULT_CONFIG };
    // repoRoot is the forest root (.workforest.yaml exists there but it's not a git repo)
    const result = await checkoutCommand("fix-from-root", repoRoot, config);
    expect(result.created).toBe(true);
    expect(result.treePath).toBe(path.join(repoRoot, "fix-from-root"));
    const stat = await fs.stat(result.treePath);
    expect(stat.isDirectory()).toBe(true);
  });

  it("checks out an existing remote branch instead of creating a new one", async () => {
    // Push a branch to the remote via the seed repo
    execSync(
      `cd "${seedDir}" && git checkout -b fix/remote-branch && touch remote.txt && git add . && git commit -m "remote commit" && git push -u origin fix/remote-branch`,
      quiet,
    );
    // Fetch in mainDir so it knows about the remote branch
    execSync(`git fetch`, { cwd: mainDir, ...quiet });

    const config = { ...DEFAULT_CONFIG };
    const result = await checkoutCommand("fix/remote-branch", mainDir, config);
    expect(result.created).toBe(true);
    expect(result.treePath).toBe(path.join(repoRoot, "fix/remote-branch"));
    // The worktree should have the file from the remote branch
    const stat = await fs.stat(path.join(result.treePath, "remote.txt"));
    expect(stat.isFile()).toBe(true);
  });

  it("throws when not inside a workforest", async () => {
    const randomDir = await fs.mkdtemp(path.join(os.tmpdir(), "wf-no-forest-"));
    const config = { ...DEFAULT_CONFIG };
    await expect(
      checkoutCommand("main", randomDir, config),
    ).rejects.toThrow("not inside a workforest");
    await fs.rm(randomDir, { recursive: true });
  });

  it("passes extra args to git worktree add", async () => {
    const config = { ...DEFAULT_CONFIG };
    // --no-track is a valid git worktree add flag that shouldn't affect the result
    const result = await checkoutCommand("extra-args-branch", mainDir, config, ["--no-track"]);
    expect(result.created).toBe(true);
    expect(result.treePath).toBe(path.join(repoRoot, "extra-args-branch"));
    const stat = await fs.stat(result.treePath);
    expect(stat.isDirectory()).toBe(true);
  });
});
