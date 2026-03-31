import { statusTrees } from "./status.js";
import type { ForestStatus } from "./status.js";

export type { ForestStatus };

export async function branchCommand(cwd: string): Promise<ForestStatus> {
  return statusTrees(cwd);
}
