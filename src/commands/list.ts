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
}

export async function listTrees(cwd: string): Promise<TreeEntry[]> {
  const forestRoot = await findForestRoot(cwd);
  if (!forestRoot) {
    throw new Error("Not inside a workforest.");
  }

  const entries = await fs.readdir(forestRoot, { withFileTypes: true });
  const trees: TreeEntry[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const entryPath = path.join(forestRoot, entry.name);
    try {
      const { stdout } = await exec(
        "git",
        ["branch", "--show-current"],
        { cwd: entryPath },
      );
      trees.push({
        name: entry.name,
        path: entryPath,
        branch: stdout.trim(),
      });
    } catch {
      // Not a git directory, skip
    }
  }

  return trees;
}
