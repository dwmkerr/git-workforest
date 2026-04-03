import { execFile } from "child_process";

// promisify(execFile) can leave handles open that prevent node from exiting;
// this wrapper resolves cleanly via the callback API
function exec(
  cmd: string,
  args: string[],
  opts: { cwd?: string } = {},
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, opts, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve({ stdout: stdout ?? "", stderr: stderr ?? "" });
    });
  });
}

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
  extraArgs: string[] = [],
): Promise<void> {
  try {
    // Check out existing branch (local or remote tracking)
    await exec("git", ["worktree", "add", treePath, branch, ...extraArgs], {
      cwd: repoDir,
    });
  } catch {
    // Branch doesn't exist — create it
    await exec("git", ["worktree", "add", "-b", branch, treePath, ...extraArgs], {
      cwd: repoDir,
    });
  }
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
  try {
    // Check out existing branch (local or remote tracking)
    await exec("git", ["checkout", branch], { cwd: targetDir });
  } catch {
    // Branch doesn't exist — create it
    await exec("git", ["checkout", "-b", branch], { cwd: targetDir });
  }
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
    const { stdout } = await exec("git", ["config", "remote.origin.url"], {
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
