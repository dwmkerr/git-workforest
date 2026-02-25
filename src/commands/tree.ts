import { gitWorktreeAdd, gitFatClone, getRepoRoot } from "../git.js";
import type { WorkforestConfig } from "../config.js";
import { resolveTreePath, findForestRoot } from "../paths.js";

export interface TreeResult {
  treePath: string;
  branch: string;
}

export async function treeCommand(
  branch: string,
  cwd: string,
  config: WorkforestConfig,
): Promise<TreeResult> {
  const forestRoot = await findForestRoot(cwd);
  if (!forestRoot) {
    throw new Error(
      "Not inside a workforest. Run 'git forest clone' or 'git forest init' first.",
    );
  }

  const gitRoot = await getRepoRoot(cwd);
  const treePath = resolveTreePath(forestRoot, config.treeDir, branch);

  if (config.fatTrees) {
    await gitFatClone(gitRoot, treePath, branch);
  } else {
    await gitWorktreeAdd(gitRoot, treePath, branch);
  }

  return { treePath, branch };
}
