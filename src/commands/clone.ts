import path from "path";
import { promises as fs } from "fs";
import { resolveRepoPath } from "../paths.js";
import { gitClone, getDefaultBranch } from "../git.js";
import type { WorkforestConfig } from "../config.js";

export interface CloneResult {
  repoRoot: string;
  treePath: string;
  branch: string;
}

export async function cloneCommand(
  repoUrl: string,
  org: string,
  repo: string,
  config: WorkforestConfig,
): Promise<CloneResult> {
  const repoRoot = resolveRepoPath(config.reposDir, {
    provider: "github",
    org,
    repo,
  });

  const tmpClone = `${repoRoot}/.wf-clone-tmp`;
  await fs.mkdir(repoRoot, { recursive: true });
  await gitClone(repoUrl, tmpClone);

  const defaultBranch = await getDefaultBranch(tmpClone);
  const treePath = path.join(repoRoot, defaultBranch);

  await fs.rename(tmpClone, treePath);

  await fs.writeFile(path.join(repoRoot, ".workforest.yaml"), "");

  return { repoRoot, treePath, branch: defaultBranch };
}
