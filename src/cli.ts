import { Command } from "commander";
import { createRequire } from "module";
import ora from "ora";
import { loadConfig } from "./config.js";
import { cloneCommand } from "./commands/clone.js";
import { checkoutCommand } from "./commands/checkout.js";
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

function printCdHint(dir: string): void {
  console.log();
  console.log(chalk.dim("# please change directory:"));
  console.log(chalk.whiteBright(`cd ${dir}`));
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

  # set up a forest (detects context automatically)
  git forest init

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
  .command("checkout <branch> [gitArgs...]")
  .alias("tree")
  .description("check out a branch (find or create its tree)")
  .allowUnknownOption()
  .action(async (branch: string, gitArgs: string[]) => {
    try {
      const config = await loadConfig();
      const result = await checkoutCommand(branch, process.cwd(), config, gitArgs);
      const rel = path.relative(process.cwd(), result.treePath);
      if (result.created) {
        console.log(`checked out ${chalk.green(result.branch)}.`);
        printCdHint(rel);
      } else if (rel) {
        console.log(`already checked out.`);
        printCdHint(rel);
      } else {
        console.log(`already on ${chalk.green(result.branch)}.`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("not inside a workforest")) {
        const context = await detectContext(process.cwd());
        if (context === "repo") {
          const { getRepoRoot } = await import("./git.js");
          const gitRoot = await getRepoRoot(process.cwd());
          const repoName = path.basename(gitRoot);
          console.log(`in repo ${chalk.whiteBright(repoName)}, not a forest yet. to migrate:\n`);
          console.log(`  ${chalk.whiteBright("git forest migrate")}`);
        } else {
          console.log("not in a repo. to get started:\n");
          console.log(`  ${chalk.whiteBright("git forest clone org/repo")}`);
        }
      } else {
        error(message);
        process.exit(1);
      }
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
        const { getLocalBranch, getRepoRoot, listLocalBranches } = await import("./git.js");
        const gitRoot = await getRepoRoot(process.cwd());
        const branch = await getLocalBranch(gitRoot);
        const branches = await listLocalBranches(gitRoot);

        const repoName = path.basename(gitRoot);
        console.log("\nexisting repo detected. migration preview:\n");
        const preview = buildMigratePreview(repoName, branch, branches);
        const dimmed = preview.replace(/#.*/g, (m) => chalk.dim(m));
        console.log(dimmed);
        console.log();

        console.log("no files will be changed, folder rename only.");
        const ok = await confirm("migrate to forest layout? (y/N) ");
        if (!ok) {
          console.log("aborted.");
          return;
        }
        const result = await migrateToForest(process.cwd());
        console.log("migrated to forest layout.");
        printCdHint(result.branch);
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
  .command("init")
  .description("Detect context and set up a forest (migrate, clone, or show status)")
  .action(async () => {
    const spinner = ora();
    try {
      const context = await detectContext(process.cwd());

      if (context === "forest") {
        const { forestRoot, trees } = await statusTrees(process.cwd());
        if (trees.length === 0) {
          console.log("forest detected, no trees found.");
          return;
        }
        const activeTree = trees.find((t) => t.active);
        const repoName = await getRepoName(
          trees[0].path,
          path.basename(forestRoot),
        );
        if (activeTree) {
          console.log(`already a forest. on branch ${chalk.green(activeTree.branch)} in ${chalk.whiteBright(repoName)}`);
        } else {
          console.log(`already a forest. in ${chalk.whiteBright(repoName)}`);
        }
        console.log();
        console.log("trees:");
        for (const tree of trees) {
          const prefix = tree.active ? "* " : tree.isDefault ? "  " : "+ ";
          const branch = tree.active
            ? chalk.green(tree.branch)
            : tree.branch;
          const rel = chalk.blue(
            "./" + path.relative(forestRoot, tree.path),
          );
          console.log(`${prefix}${branch}  ${rel}`);
        }
      } else if (context === "repo") {
        const { getLocalBranch, getRepoRoot, listLocalBranches } = await import("./git.js");
        const gitRoot = await getRepoRoot(process.cwd());
        const branch = await getLocalBranch(gitRoot);
        const branches = await listLocalBranches(gitRoot);
        const config = await loadConfig();

        const repoName = path.basename(gitRoot);
        console.log("\nexisting repo detected. migration preview:\n");
        const preview = buildMigratePreview(repoName, branch, branches);
        const dimmed = preview.replace(/#.*/g, (m) => chalk.dim(m));
        console.log(dimmed);
        console.log();

        console.log("no files will be changed, folder rename only.");
        const ok = await confirm("migrate to forest layout? (y/N) ");
        if (!ok) {
          console.log("aborted.");
          return;
        }
        const result = await migrateToForest(process.cwd());
        console.log("migrated to forest layout.");
        printCdHint(result.branch);
      } else {
        console.log("no forest found. clone one with:\n");
        console.log(`  ${chalk.whiteBright("git forest clone org/repo")}`);
        console.log(`  ${chalk.whiteBright("git forest clone git@github.com:org/repo.git")}`);
      }
    } catch (err: unknown) {
      spinner.stop();
      const message = err instanceof Error ? err.message : String(err);
      error(message);
      process.exit(1);
    }
  });

async function runStatus(): Promise<void> {
  try {
    const { forestRoot, trees } = await statusTrees(process.cwd());
    if (trees.length === 0) {
      console.log("no trees found.");
      return;
    }

    const activeTree = trees.find((t) => t.active);
    const repoName = await getRepoName(trees[0].path, path.basename(forestRoot));
    if (activeTree) {
      console.log(`on branch ${chalk.green(activeTree.branch)} in ${chalk.whiteBright(repoName)}`);
    } else {
      console.log(`in ${chalk.whiteBright(repoName)}`);
    }
    console.log();
    console.log("trees:");
    for (const tree of trees) {
      const prefix = tree.active ? "* " : tree.isDefault ? "  " : "+ ";
      const branch = tree.active ? chalk.green(tree.branch) : tree.branch;
      const rel = chalk.blue("./" + path.relative(forestRoot, tree.path));
      console.log(`${prefix}${branch}  ${rel}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("not inside a workforest")) {
      const context = await detectContext(process.cwd());
      if (context === "repo") {
        const { getRepoRoot } = await import("./git.js");
        const gitRoot = await getRepoRoot(process.cwd());
        const repoName = path.basename(gitRoot);
        console.log(`in repo ${chalk.whiteBright(repoName)}, not a forest yet. to migrate:\n`);
        console.log(`  ${chalk.whiteBright("git forest migrate")}`);
      } else {
        console.log("not in a repo. to get started:\n");
        console.log(`  ${chalk.whiteBright("git forest clone org/repo")}`);
      }
    } else {
      error(message);
      process.exit(1);
    }
  }
}

program
  .command("status")
  .description("Show trees and current branch for the forest")
  .action(runStatus);

program.parse();
