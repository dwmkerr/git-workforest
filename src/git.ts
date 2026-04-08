import { execFile } from "child_process";
import chalk from "chalk";

export interface GitOptions {
  verbose?: boolean;
}

// promisify(execFile) can leave handles open that prevent node from exiting;
// this wrapper resolves cleanly via the callback API
export function gitExec(
  cmd: string,
  args: string[],
  opts: { cwd?: string; verbose?: boolean } = {},
): Promise<{ stdout: string; stderr: string }> {
  const { verbose, ...execOpts } = opts;
  return new Promise((resolve, reject) => {
    if (verbose) {
      console.log(chalk.dim(`$ ${cmd} ${args.join(" ")}`));
    }
    execFile(cmd, args, execOpts, (err, stdout, stderr) => {
      if (verbose) {
        if (stdout?.trim()) process.stdout.write(chalk.dim(stdout));
        if (stderr?.trim()) process.stderr.write(chalk.dim(stderr));
      }
      if (err) reject(err);
      else resolve({ stdout: stdout ?? "", stderr: stderr ?? "" });
    });
  });
}

// Internal alias for brevity
const exec = gitExec;

export async function gitClone(
  repoUrl: string,
  targetDir: string,
  opts: GitOptions = {},
): Promise<void> {
  await exec("git", ["clone", repoUrl, targetDir], { verbose: opts.verbose });
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
  opts: GitOptions = {},
): Promise<void> {
  try {
    // Check out existing branch (local or remote tracking)
    await exec("git", ["worktree", "add", treePath, branch, ...extraArgs], {
      cwd: repoDir,
      verbose: opts.verbose,
    });
  } catch {
    // Branch doesn't exist — create it
    await exec("git", ["worktree", "add", "-b", branch, treePath, ...extraArgs], {
      cwd: repoDir,
      verbose: opts.verbose,
    });
  }
}

export async function gitFatClone(
  sourceDir: string,
  targetDir: string,
  branch: string,
  opts: GitOptions = {},
): Promise<void> {
  const { stdout } = await exec("git", ["remote", "get-url", "origin"], {
    cwd: sourceDir,
    verbose: opts.verbose,
  });
  const originUrl = stdout.trim();
  await exec("git", ["clone", originUrl, targetDir], { verbose: opts.verbose });
  try {
    // Check out existing branch (local or remote tracking)
    await exec("git", ["checkout", branch], { cwd: targetDir, verbose: opts.verbose });
  } catch {
    // Branch doesn't exist — create it
    await exec("git", ["checkout", "-b", branch], { cwd: targetDir, verbose: opts.verbose });
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
