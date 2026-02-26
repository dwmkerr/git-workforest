import { Command } from "commander";
import { createRequire } from "module";
import ora from "ora";
import { loadConfig } from "./config.js";
import { cloneCommand } from "./commands/clone.js";
import { treeCommand } from "./commands/tree.js";
import { detectContext, migrateToForest } from "./commands/migrate.js";
import { resolveRepoPath } from "./paths.js";
import readline from "readline/promises";
import chalk from "chalk";
import { statusTrees } from "./commands/status.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

function error(message: string): void {
  console.error(`${chalk.red("error:")} ${message}`);
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(question);
  rl.close();
  return answer.toLowerCase() !== "n";
}

const program = new Command();

program
  .name("git-workforest")
  .description(
    "Managed worktrees with structure. Clone once, branch into folders.",
  )
  .version(version)
  .action(() => {
    console.log("usage:");
    console.log("");
    console.log("  clone a repo into a structured forest:");
    console.log("    git forest clone dwmkerr/effective-shell");
    console.log("");
    console.log("  migrate an existing repo to forest layout:");
    console.log("    cd ~/repos/myproject && git forest migrate");
    console.log("");
    console.log("  create a worktree for a branch:");
    console.log("    git forest tree fix-typo");
    console.log("");
    console.log("  show forest status:");
    console.log("    git forest status");
    console.log("");
    console.log(`run ${chalk.dim("git forest --help")} for all options.`);
  });

program
  .command("clone <repo>")
  .description("Clone a GitHub repo into the structured forest path")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(async (repo: string, opts: { yes?: boolean }) => {
    const spinner = ora();
    try {
      const config = await loadConfig();
      const parts = repo.split("/");
      if (parts.length !== 2) {
        throw new Error(
          "expected format: org/repo (e.g. dwmkerr/effective-shell)",
        );
      }
      const [org, repoName] = parts;
      const repoUrl = `git@github.com:${org}/${repoName}`;
      const targetPath = resolveRepoPath(config.reposDir, {
        provider: "github",
        org,
        repo: repoName,
      });

      if (!opts.yes) {
        const ok = await confirm(
          `clone ${org}/${repoName} to ${targetPath}? (Y/n) `,
        );
        if (!ok) {
          console.log("aborted.");
          return;
        }
      }

      spinner.start(`cloning ${org}/${repoName}...`);
      const result = await cloneCommand(repoUrl, org, repoName, config);
      spinner.succeed(`cloned to ${result.treePath}`);
    } catch (err: unknown) {
      spinner.stop();
      const message = err instanceof Error ? err.message : String(err);
      error(message);
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
      spinner.start(`creating tree for ${branch}...`);
      const result = await treeCommand(branch, process.cwd(), config);
      spinner.succeed(`tree created at ${result.treePath}`);
    } catch (err: unknown) {
      spinner.stop();
      const message = err instanceof Error ? err.message : String(err);
      error(message);
      process.exit(1);
    }
  });

program
  .command("migrate")
  .description("Migrate an existing repo to forest layout, or clone a new one")
  .action(async () => {
    const spinner = ora();
    try {
      const config = await loadConfig();
      const context = await detectContext(process.cwd());

      if (context === "repo") {
        const ok = await confirm(
          "existing repo detected. migrate to forest layout? (y/N) ",
        );
        if (!ok) {
          console.log("aborted.");
          return;
        }
        spinner.start("migrating to forest layout...");
        const result = await migrateToForest(process.cwd());
        spinner.succeed(`migrated. main tree at ${result.treePath}`);
      } else {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        const repo = await rl.question(
          "no repo found. enter org/repo to clone (e.g. dwmkerr/effective-shell): ",
        );
        rl.close();
        if (!repo || !repo.includes("/")) {
          console.log("aborted.");
          return;
        }
        const [org, repoName] = repo.split("/");
        const repoUrl = `git@github.com:${org}/${repoName}`;
        spinner.start(`cloning ${org}/${repoName}...`);
        const result = await cloneCommand(repoUrl, org, repoName, config);
        spinner.succeed(`cloned to ${result.treePath}`);
      }
    } catch (err: unknown) {
      spinner.stop();
      const message = err instanceof Error ? err.message : String(err);
      error(message);
      process.exit(1);
    }
  });

program
  .command("status")
  .description("Show trees and current branch for the forest")
  .action(async () => {
    try {
      const trees = await statusTrees(process.cwd());
      if (trees.length === 0) {
        console.log("no trees found.");
        return;
      }
      for (const tree of trees) {
        const prefix = tree.active ? "* " : "  ";
        const name = tree.active ? chalk.green(tree.name) : tree.name;
        console.log(
          `${prefix}${name}  ${chalk.dim(tree.branch)}  ${chalk.dim(tree.path)}`,
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      error(message);
      process.exit(1);
    }
  });

program.parse();
