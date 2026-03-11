import { gitWorktreeAdd, gitFatClone, getRepoRoot } from "../git.js";
import type { WorkforestConfig } from "../config.js";
import { resolveTreePath, findForestRoot } from "../paths.js";
import { statusTrees } from "./status.js";

export interface CheckoutResult {
  treePath: string;
  branch: string;
  created: boolean;
}

export async function checkoutCommand(
  branch: string,
  cwd: string,
  config: WorkforestConfig,
  extraArgs: string[] = [],
): Promise<CheckoutResult> {
  const forestRoot = await findForestRoot(cwd);
  if (!forestRoot) {
    throw new Error(
      "not inside a workforest.\ntry 'git forest clone <org/repo>' or 'git forest migrate'",
    );
  }

  const { trees } = await statusTrees(cwd);
  const match = trees.find((t) => t.branch === branch || t.name === branch);
  if (match) {
    return { treePath: match.path, branch: match.branch, created: false };
  }

  // resolve git root from cwd if inside a tree, or fall back to an existing
  // tree when running from the forest root (which is not a git repo itself)
  let gitRoot: string;
  try {
    gitRoot = await getRepoRoot(cwd);
  } catch {
    if (trees.length === 0) {
      throw new Error(
        "no git trees found in forest.\ntry 'git forest clone <org/repo>' to add a repo",
      );
    }
    gitRoot = await getRepoRoot(trees[0].path);
  }
  const treePath = resolveTreePath(forestRoot, config.treeDir, branch);

  if (config.fatTrees) {
    await gitFatClone(gitRoot, treePath, branch);
  } else {
    await gitWorktreeAdd(gitRoot, treePath, branch, extraArgs);
  }

  return { treePath, branch, created: true };
}
