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
}

export interface ForestStatus {
  forestRoot: string;
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

export async function statusTrees(cwd: string): Promise<ForestStatus> {
  const forestRoot = await findForestRoot(cwd);
  if (!forestRoot) {
    throw new Error(
      "not inside a workforest.\ntry 'git forest clone <org/repo>' or 'git forest migrate'",
    );
  }

  const resolvedCwd = path.resolve(cwd);
  const trees = await findTrees(forestRoot, forestRoot, resolvedCwd);

  return { forestRoot, trees };
}

export function formatTreeLine(tree: TreeEntry, forestRoot: string): string {
  const prefix = tree.active ? "* " : "  ";
  const rel = "./" + path.relative(forestRoot, tree.path);
  return `${prefix}${tree.branch}  ${rel}`;
}
