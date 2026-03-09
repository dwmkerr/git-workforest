import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

export async function gitClone(
  repoUrl: string,
  targetDir: string,
): Promise<void> {
  await exec("git", ["clone", repoUrl, targetDir]);
}

export async function getDefaultBranch(repoDir: string): Promise<string> {
  const { stdout } = await exec(
    "git",
    ["symbolic-ref", "refs/remotes/origin/HEAD", "--short"],
    { cwd: repoDir },
  );
  return stdout.trim().replace("origin/", "");
}

export async function getLocalBranch(repoDir: string): Promise<string> {
  const { stdout } = await exec("git", ["branch", "--show-current"], {
    cwd: repoDir,
  });
  return stdout.trim() || "main";
}

export async function gitWorktreeAdd(
  repoDir: string,
  treePath: string,
  branch: string,
): Promise<void> {
  await exec("git", ["worktree", "add", "-b", branch, treePath, "HEAD"], {
    cwd: repoDir,
  });
}

export async function gitFatClone(
  sourceDir: string,
  targetDir: string,
  branch: string,
): Promise<void> {
  const { stdout } = await exec("git", ["remote", "get-url", "origin"], {
    cwd: sourceDir,
  });
  const originUrl = stdout.trim();
  await exec("git", ["clone", originUrl, targetDir]);
  await exec("git", ["checkout", "-b", branch], { cwd: targetDir });
}

export async function isInsideWorktree(dir: string): Promise<boolean> {
  try {
    await exec("git", ["rev-parse", "--is-inside-work-tree"], { cwd: dir });
    return true;
  } catch {
    return false;
  }
}

export async function getRepoName(dir: string, fallback?: string): Promise<string> {
  try {
    const { stdout } = await exec("git", ["remote", "get-url", "origin"], {
      cwd: dir,
    });
    const url = stdout.trim();
    const match = url.match(/[/:]([^/]+\/[^/]+?)(?:\.git)?$/);
    if (match) return match[1];
  } catch {
    // no remote configured
  }
  return fallback || dir.split("/").pop() || dir;
}

export async function listLocalBranches(repoDir: string): Promise<string[]> {
  const { stdout } = await exec(
    "git",
    ["branch", "--format=%(refname:short)"],
    { cwd: repoDir },
  );
  return stdout.trim().split("\n").filter(Boolean);
}

export async function getRepoRoot(dir: string): Promise<string> {
  const { stdout } = await exec(
    "git",
    ["rev-parse", "--show-toplevel"],
    { cwd: dir },
  );
  return stdout.trim();
}
