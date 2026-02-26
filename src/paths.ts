import os from "os";
import path from "path";
import { promises as fs } from "fs";

export interface RepoTokens {
  provider: string;
  org: string;
  repo: string;
}

export function resolveRepoPath(
  pattern: string,
  tokens: RepoTokens,
): string {
  let resolved = pattern
    .replace("[provider]", tokens.provider)
    .replace("[org]", tokens.org)
    .replace("[repo]", tokens.repo);

  if (resolved.startsWith("~")) {
    resolved = path.join(os.homedir(), resolved.slice(1));
  }

  return resolved;
}

export function resolveTreePath(
  repoRoot: string,
  treePattern: string,
  branch: string,
): string {
  const treeDir = treePattern.replace("[branch]", branch);
  return path.join(repoRoot, treeDir);
}

export async function findForestRoot(
  startDir: string,
): Promise<string | null> {
  let dir = path.resolve(startDir);
  const root = path.parse(dir).root;

  while (dir !== root) {
    try {
      await fs.access(path.join(dir, ".workforest.yaml"));
      return dir;
    } catch {
      dir = path.dirname(dir);
    }
  }

  return null;
}
