import path from "path";
import { promises as fs } from "fs";
import { getRepoRoot, getLocalBranch, isInsideWorktree } from "../git.js";

export interface InitResult {
  repoRoot: string;
  treePath: string;
  branch: string;
}

export async function detectContext(cwd: string): Promise<"empty" | "repo"> {
  if (await isInsideWorktree(cwd)) return "repo";
  return "empty";
}

export async function migrateToForest(cwd: string): Promise<InitResult> {
  const gitRoot = await getRepoRoot(cwd);
  const branch = await getLocalBranch(gitRoot);
  const repoRoot = gitRoot;
  const tmpName = `.wf-migrate-tmp-${Date.now()}`;
  const tmpPath = path.join(path.dirname(repoRoot), tmpName);
  const treePath = path.join(repoRoot, branch);

  await fs.rename(repoRoot, tmpPath);
  await fs.mkdir(repoRoot, { recursive: true });
  await fs.rename(tmpPath, treePath);

  await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), "");

  return { repoRoot, treePath, branch };
}
