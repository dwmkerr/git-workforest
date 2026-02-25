import { Command } from "commander";
import { createRequire } from "module";
import ora from "ora";
import { loadConfig } from "./config.js";
import { cloneCommand } from "./commands/clone.js";
import { treeCommand } from "./commands/tree.js";
import { detectContext, migrateToForest } from "./commands/init.js";
import readline from "readline/promises";
import chalk from "chalk";
import { listTrees } from "./commands/list.js";

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

program
  .command("init")
  .description("Interactive setup: clone a new repo or migrate an existing one")
  .action(async () => {
    const spinner = ora();
    try {
      const config = await loadConfig();
      const context = await detectContext(process.cwd());

      if (context === "repo") {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        const answer = await rl.question(
          "Existing repo detected. Migrate to forest layout? (y/N) ",
        );
        rl.close();
        if (answer.toLowerCase() !== "y") {
          console.log("Aborted.");
          return;
        }
        spinner.start("Migrating to forest layout...");
        const result = await migrateToForest(process.cwd());
        spinner.succeed(`Migrated. Main tree at ${result.treePath}`);
      } else {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        const repo = await rl.question(
          "No repo found. Enter org/repo to clone (e.g. dwmkerr/effective-shell): ",
        );
        rl.close();
        if (!repo || !repo.includes("/")) {
          console.log("Aborted.");
          return;
        }
        const [org, repoName] = repo.split("/");
        const repoUrl = `git@github.com:${org}/${repoName}`;
        spinner.start(`Cloning ${org}/${repoName}...`);
        const result = await cloneCommand(repoUrl, org, repoName, config);
        spinner.succeed(`Cloned to ${result.treePath}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      spinner.fail(message);
      process.exit(1);
    }
  });

program
  .command("list")
  .description("Show trees for the current forest")
  .action(async () => {
    try {
      const trees = await listTrees(process.cwd());
      if (trees.length === 0) {
        console.log("No trees found.");
        return;
      }
      for (const tree of trees) {
        console.log(
          `  ${chalk.green(tree.name)}  ${chalk.dim(tree.branch)}  ${chalk.dim(tree.path)}`,
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    }
  });

program.parse();
