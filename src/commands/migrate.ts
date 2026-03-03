import path from "path";
import { promises as fs } from "fs";
import { getRepoRoot, getLocalBranch, isInsideWorktree } from "../git.js";
import { findForestRoot } from "../paths.js";

export interface MigrateResult {
  repoRoot: string;
  treePath: string;
  branch: string;
}

export async function detectContext(
  cwd: string,
): Promise<"forest" | "repo" | "empty"> {
  if (await findForestRoot(cwd)) return "forest";
  if (await isInsideWorktree(cwd)) return "repo";
  return "empty";
}

export function buildMigratePreview(
  repoName: string,
  branch: string,
): string {
  const lines = [
    "  # before",
    `  ${repoName}/`,
    "",
    "  # after",
    `  ${repoName}/`,
    "    .workforest.yaml       # preferences",
    `    ${branch}/                  # main branch`,
    "    <branch-1>/            # worktree",
    "    <branch-2>/            # etc",
  ];

  return lines.join("\n");
}

export async function migrateToForest(cwd: string): Promise<MigrateResult> {
  const gitRoot = await getRepoRoot(cwd);
  const branch = await getLocalBranch(gitRoot);
  const repoRoot = gitRoot;
  const treePath = path.join(repoRoot, branch);

  // Create the branch subdirectory and move all existing contents into it.
  // This keeps the parent directory inode stable so the user's shell stays
  // at the forest root without needing to refresh pwd.
  await fs.mkdir(treePath, { recursive: true });
  const entries = await fs.readdir(repoRoot);
  for (const entry of entries) {
    if (entry === branch) continue;
    await fs.rename(
      path.join(repoRoot, entry),
      path.join(treePath, entry),
    );
  }

  await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), "");

  return { repoRoot, treePath, branch };
}
