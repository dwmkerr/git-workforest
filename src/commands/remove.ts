import { promises as fs } from "fs";
import path from "path";
import { execFile } from "child_process";
import { findForestRoot } from "../paths.js";
import { statusTrees } from "./status.js";

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

export interface RemoveResult {
  treePath: string;
  branch: string;
}

export async function removeCommand(
  branch: string,
  cwd: string,
  force?: boolean,
): Promise<RemoveResult> {
  const forestRoot = await findForestRoot(cwd);
  if (!forestRoot) {
    throw new Error(
      "not inside a workforest.\ntry 'git forest clone <org/repo>' or 'git forest migrate'",
    );
  }

  const { trees } = await statusTrees(cwd);
  const match = trees.find((t) => t.branch === branch || t.name === branch);
  if (!match) {
    throw new Error(`tree '${branch}' not found.`);
  }

  if (match.active) {
    const err = new Error("cannot remove the active tree.");
    (err as Error & { forestRoot: string }).forestRoot = forestRoot;
    throw err;
  }

  // Check if this is a git worktree (vs a fat tree / standalone clone)
  const isWorktree = await checkIsWorktree(match.path);

  if (isWorktree) {
    // Use git worktree remove — it checks for uncommitted changes
    const gitRoot = await getWorktreeGitRoot(match.path);
    const args = ["worktree", "remove", match.path];
    if (force) args.splice(2, 0, "--force");
    try {
      await exec("git", args, { cwd: gitRoot });
    } catch (err: unknown) {
      const msg = err instanceof Error ? (err as { stderr?: string }).stderr || err.message : String(err);
      if (msg.includes("contains modified or untracked files") || msg.includes("is dirty")) {
        throw new Error(`tree '${branch}' has uncommitted changes. use -f to force.`);
      }
      throw err;
    }
  } else {
    // Fat tree — check for uncommitted changes unless forced
    if (!force) {
      const { stdout } = await exec("git", ["status", "--porcelain"], { cwd: match.path });
      if (stdout.trim()) {
        throw new Error(`tree '${branch}' has uncommitted changes. use -f to force.`);
      }
    }
    await fs.rm(match.path, { recursive: true });
  }

  // Clean up empty parent directories between forest root and the removed tree
  let dir = path.dirname(match.path);
  while (dir !== forestRoot && dir.startsWith(forestRoot)) {
    const entries = await fs.readdir(dir);
    if (entries.length === 0) {
      await fs.rmdir(dir);
      dir = path.dirname(dir);
    } else {
      break;
    }
  }

  return { treePath: match.path, branch: match.branch };
}

async function checkIsWorktree(dir: string): Promise<boolean> {
  try {
    const { stdout } = await exec(
      "git",
      ["rev-parse", "--git-common-dir"],
      { cwd: dir },
    );
    const commonDir = stdout.trim();
    const { stdout: gitDir } = await exec(
      "git",
      ["rev-parse", "--git-dir"],
      { cwd: dir },
    );
    // In a worktree, .git is a file pointing elsewhere; git-dir differs from common-dir
    return path.resolve(dir, gitDir.trim()) !== path.resolve(dir, commonDir);
  } catch {
    return false;
  }
}

async function getWorktreeGitRoot(dir: string): Promise<string> {
  const { stdout } = await exec(
    "git",
    ["rev-parse", "--git-common-dir"],
    { cwd: dir },
  );
  // common-dir points to the main repo's .git — its parent is the main worktree
  const commonDir = path.resolve(dir, stdout.trim());
  return path.dirname(commonDir);
}
