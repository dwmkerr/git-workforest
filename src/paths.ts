import os from "os";
import path from "path";
import { promises as fs } from "fs";
import { parse as parseYaml } from "yaml";

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

export interface ForestRoot {
  forestRoot: string;
  remote: string;
}

export async function findForestRoot(
  startDir: string,
): Promise<ForestRoot | null> {
  let dir = path.resolve(startDir);
  const root = path.parse(dir).root;
  const home = os.homedir();

  while (dir !== root) {
    if (dir === home) break;

    const markerPath = path.join(dir, ".workforest.yaml");
    try {
      const content = await fs.readFile(markerPath, "utf-8");
      const parsed = parseYaml(content) ?? {};
      const remote = typeof parsed === "object" && parsed !== null && "remote" in parsed
        ? (parsed as Record<string, unknown>).remote
        : undefined;

      if (typeof remote === "string" && remote.length > 0) {
        return { forestRoot: dir, remote };
      }
    } catch {
      // No file here — keep walking
    }

    dir = path.dirname(dir);
  }

  return null;
}
