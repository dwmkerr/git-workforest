import path from "path";
import { promises as fs } from "fs";
import { getRepoRoot, getLocalBranch, isInsideWorktree } from "../git.js";

export interface MigrateResult {
  repoRoot: string;
  treePath: string;
  branch: string;
}

export async function detectContext(cwd: string): Promise<"empty" | "repo"> {
  if (await isInsideWorktree(cwd)) return "repo";
  return "empty";
}

export async function buildMigratePreview(
  cwd: string,
  branch: string,
): Promise<string> {
  const entries = await fs.readdir(cwd);
  const labeled: string[] = [];
  for (const name of entries.sort()) {
    const stat = await fs.stat(path.join(cwd, name));
    labeled.push(stat.isDirectory() ? `${name}/` : name);
  }

  const MAX_SHOW = 6;
  const shown = labeled.slice(0, MAX_SHOW).join("  ");
  const suffix =
    labeled.length > MAX_SHOW ? `  ... (${labeled.length} items)` : "";
  const items = shown + suffix;

  const lines = [
    "  before:",
    `    ${items}`,
    "",
    "  after:",
    "    .workforest.yaml",
    `    ${branch}/`,
    `      ${items}`,
  ];

  return lines.join("\n");
}

export async function migrateToForest(cwd: string): Promise<MigrateResult> {
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
