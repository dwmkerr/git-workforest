import { promises as fs } from "fs";
import path from "path";
import { findForestRoot } from "../paths.js";
import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

export interface TreeEntry {
  name: string;
  path: string;
  branch: string;
  active: boolean;
  isDefault: boolean;
}

export interface ForestStatus {
  forestRoot: string;
  defaultBranch: string | null;
  trees: TreeEntry[];
}

const SKIP_DIRS = new Set(["node_modules", ".git", ".worktrees"]);

async function findTrees(
  dir: string,
  forestRoot: string,
  resolvedCwd: string,
): Promise<TreeEntry[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const trees: TreeEntry[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const entryPath = path.join(dir, entry.name);
    try {
      const { stdout } = await exec(
        "git",
        ["branch", "--show-current"],
        { cwd: entryPath },
      );
      const branch = stdout.trim();
      if (branch) {
        const active = resolvedCwd.startsWith(entryPath);
        trees.push({
          name: path.relative(forestRoot, entryPath),
          path: entryPath,
          branch,
          active,
        });
        continue;
      }
    } catch {
      // Not a git directory — recurse into it
    }

    const nested = await findTrees(entryPath, forestRoot, resolvedCwd);
    trees.push(...nested);
  }

  return trees;
}

export async function getDefaultBranch(gitDir: string): Promise<string | null> {
  try {
    const { stdout } = await exec(
      "git",
      ["symbolic-ref", "refs/remotes/origin/HEAD"],
      { cwd: gitDir },
    );
    const ref = stdout.trim();
    return ref.split("/").pop() || null;
  } catch {
    return null;
  }
}

function sortTrees(trees: TreeEntry[], defaultBranch: string | null): TreeEntry[] {
  return [...trees].sort((a, b) => {
    if (defaultBranch) {
      if (a.branch === defaultBranch) return -1;
      if (b.branch === defaultBranch) return 1;
    }
    return a.branch.localeCompare(b.branch);
  });
}

export async function statusTrees(cwd: string): Promise<ForestStatus> {
  const forestRoot = await findForestRoot(cwd);
  if (!forestRoot) {
    throw new Error(
      "not inside a workforest.\ntry 'git forest clone <org/repo>' or 'git forest migrate'",
    );
  }

  const resolvedCwd = path.resolve(cwd);
  const trees = await findTrees(forestRoot, forestRoot, resolvedCwd);

  // Detect default branch: git symbolic-ref, then fallback to main/master
  const firstTree = trees[0];
  let defaultBranch = firstTree ? await getDefaultBranch(firstTree.path) : null;
  if (!defaultBranch) {
    if (trees.some((t) => t.branch === "main")) defaultBranch = "main";
    else if (trees.some((t) => t.branch === "master")) defaultBranch = "master";
  }

  for (const tree of trees) {
    tree.isDefault = tree.branch === defaultBranch;
  }

  const sorted = sortTrees(trees, defaultBranch);

  return { forestRoot, defaultBranch, trees: sorted };
}

export function formatTreeLine(tree: TreeEntry, forestRoot: string): string {
  const prefix = tree.active ? "* " : tree.isDefault ? "  " : "+ ";
  const rel = "./" + path.relative(forestRoot, tree.path);
  return `${prefix}${tree.branch}  ${rel}`;
}
