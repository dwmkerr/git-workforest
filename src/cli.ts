import { Command } from "commander";
import { createRequire } from "module";
import ora from "ora";
import { loadConfig } from "./config.js";
import { cloneCommand } from "./commands/clone.js";
import { treeCommand } from "./commands/tree.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const program = new Command();

program
  .name("git-workforest")
  .description(
    "Managed worktrees with structure. Clone once, branch into folders.",
  )
  .version(version);

program
  .command("clone <repo>")
  .description("Clone a GitHub repo into the structured forest path")
  .action(async (repo: string) => {
    const spinner = ora();
    try {
      const config = await loadConfig();
      const parts = repo.split("/");
      if (parts.length !== 2) {
        throw new Error(
          "Expected format: org/repo (e.g. dwmkerr/effective-shell)",
        );
      }
      const [org, repoName] = parts;
      const repoUrl = `git@github.com:${org}/${repoName}`;
      spinner.start(`Cloning ${org}/${repoName}...`);
      const result = await cloneCommand(repoUrl, org, repoName, config);
      spinner.succeed(`Cloned to ${result.treePath}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      spinner.fail(message);
      process.exit(1);
    }
  });

program
  .command("tree <branch>")
  .description("Create a new tree (worktree or clone) for a branch")
  .action(async (branch: string) => {
    const spinner = ora();
    try {
      const config = await loadConfig();
      spinner.start(`Creating tree for ${branch}...`);
      const result = await treeCommand(branch, process.cwd(), config);
      spinner.succeed(`Tree created at ${result.treePath}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      spinner.fail(message);
      process.exit(1);
    }
  });

program.parse();
