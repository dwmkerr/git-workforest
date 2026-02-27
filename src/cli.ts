import { Command } from "commander";
import { createRequire } from "module";
import ora from "ora";
import { loadConfig } from "./config.js";
import { cloneCommand } from "./commands/clone.js";
import { treeCommand } from "./commands/tree.js";
import {
  detectContext,
  migrateToForest,
  buildMigratePreview,
} from "./commands/migrate.js";
import { resolveRepoPath } from "./paths.js";
import readline from "readline/promises";
import chalk from "chalk";
import path from "path";
import { statusTrees, formatTreeLine } from "./commands/status.js";
import { getRepoName } from "./git.js";

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
  .addHelpText(
    "after",
    `
examples:

  # clone a repo into a structured forest
  git forest clone dwmkerr/effective-shell

  # migrate an existing repo to forest layout
  cd ~/repos/myproject && git forest migrate

  # show forest status
  git forest status`,
  );

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
        const { getLocalBranch, getRepoRoot } = await import("./git.js");
        const gitRoot = await getRepoRoot(process.cwd());
        const branch = await getLocalBranch(gitRoot);

        console.log("\nexisting repo detected. migration preview:\n");
        const preview = await buildMigratePreview(process.cwd(), branch);
        console.log(preview);
        console.log();

        const ok = await confirm("migrate to forest layout? (y/N) ");
        if (!ok) {
          console.log("aborted.");
          return;
        }
        spinner.start("migrating...");
        const result = await migrateToForest(process.cwd());
        spinner.succeed("migrated to forest layout");
        console.log(chalk.cyan(`cd ${result.branch}`));
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
      const { forestRoot, trees } = await statusTrees(process.cwd());
      if (trees.length === 0) {
        console.log("no trees found.");
        return;
      }

      const activeTree = trees.find((t) => t.active);
      const repoName = await getRepoName(trees[0].path, path.basename(forestRoot));
      if (activeTree) {
        console.log(`on branch ${activeTree.branch} in ${repoName}`);
      } else {
        console.log(`in ${repoName}`);
      }
      console.log();
      console.log("trees:");
      for (const tree of trees) {
        const prefix = tree.active ? "* " : "  ";
        const branch = tree.active ? chalk.green(tree.branch) : tree.branch;
        const rel = chalk.dim("./" + path.relative(forestRoot, tree.path));
        console.log(`${prefix}${branch}  ${rel}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      error(message);
      process.exit(1);
    }
  });

program.parse();
