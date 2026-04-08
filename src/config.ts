import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const ConfigSchema = z.object({
  reposDir: z.string().default("~/repos/[provider]/[org]/[repo]"),
  treeDir: z.string().default("[branch]"),
  fatTrees: z.boolean().default(false),
  verbose: z.boolean().default(false),
});

export type WorkforestConfig = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: WorkforestConfig = {
  reposDir: "~/repos/[provider]/[org]/[repo]",
  treeDir: "[branch]",
  fatTrees: false,
  verbose: false,
};

export async function loadConfig(
  configPath?: string,
): Promise<WorkforestConfig> {
  const resolvedPath =
    configPath ?? path.join(os.homedir(), ".workforest.yaml");

  let raw: Record<string, unknown> = {};
  try {
    const content = await fs.readFile(resolvedPath, "utf-8");
    raw = parseYaml(content) ?? {};
  } catch {
    return DEFAULT_CONFIG;
  }

  return ConfigSchema.parse(raw);
}
