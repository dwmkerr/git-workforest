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
  currentBranch: string,
  branches: string[],
): string {
  const lines = [
    "  # before",
    `  ${repoName}/`,
    "",
    "  # after",
    `  ${repoName}/`,
    "    .workforest.yaml       # preferences",
    `    ${currentBranch}/  # current branch`,
  ];

  const otherBranches = branches.filter((b) => b !== currentBranch);

  if (otherBranches.length === 0) {
    lines.push("    <branch-1>/            # worktree");
    lines.push("    <branch-2>/            # etc");
  } else {
    const shown = otherBranches.slice(0, 2);
    for (const b of shown) {
      lines.push(`    ${b}/  # worktree`);
    }
    if (otherBranches.length > 2) {
      lines.push("    ...");
    }
  }

  return lines.join("\n");
}

export async function migrateToForest(cwd: string): Promise<MigrateResult> {
  const gitRoot = await getRepoRoot(cwd);
  const branch = await getLocalBranch(gitRoot);
  const repoRoot = gitRoot;
  const treePath = path.join(repoRoot, branch);

  // Stage everything into a temp dir first so that mkdir for branch paths
  // containing '/' (e.g. feat/foo) won't collide with existing entries.
  const staging = path.join(repoRoot, `.workforest-migrate-${Date.now()}`);
  await fs.mkdir(staging);

  const entries = await fs.readdir(repoRoot);
  for (const entry of entries) {
    if (entry === path.basename(staging)) continue;
    await fs.rename(
      path.join(repoRoot, entry),
      path.join(staging, entry),
    );
  }

  await fs.mkdir(treePath, { recursive: true });

  const stagedEntries = await fs.readdir(staging);
  for (const entry of stagedEntries) {
    await fs.rename(
      path.join(staging, entry),
      path.join(treePath, entry),
    );
  }

  await fs.rm(staging, { recursive: true });
  await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), "");

  return { repoRoot, treePath, branch };
}
