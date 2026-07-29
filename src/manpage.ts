import type { Command, Option } from "commander";

export const manPageFiles = [
  "workforest.1",
  "git-forest.1",
  "git-workforest.1",
] as const;

function escapeRoff(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/-/g, "\\-")
    .replace(/^([.'])/gm, "\\&$1");
}

function quoted(value: string): string {
  return `"${escapeRoff(value).replace(/"/g, "\\(dq")}"`;
}

function renderOption(option: Option): string[] {
  return [
    ".TP",
    `.B ${quoted(option.flags)}`,
    escapeRoff(option.description),
  ];
}

function commandTerm(command: Command): string {
  const aliases = command.aliases();
  const names = [command.name(), ...aliases].join("|");
  const options = command.options.length > 0 ? " [options]" : "";
  const args = command.registeredArguments
    .map((argument) => {
      const name = `${argument.name()}${argument.variadic ? "..." : ""}`;
      return argument.required ? `<${name}>` : `[${name}]`;
    })
    .join(" ");

  return `${names}${options}${args ? ` ${args}` : ""}`;
}

function renderCommand(command: Command): string[] {
  const lines = [
    ".TP",
    `.B ${quoted(commandTerm(command))}`,
    escapeRoff(command.description()),
  ];

  if (command.options.length > 0) {
    lines.push(".RS");
    for (const option of command.options) {
      lines.push(...renderOption(option));
    }
    lines.push(".RE");
  }

  return lines;
}

export function renderPrimaryManPage(
  program: Command,
  examples: string,
): string {
  const description = program.description();
  const lines = [
    `.TH WORKFOREST 1 "" "workforest" "User Commands"`,
    ".SH NAME",
    `${escapeRoff("workforest, git-forest, git-workforest")} \\- ${escapeRoff(description)}`,
    ".SH SYNOPSIS",
    `.B ${quoted("workforest [options] [command]")}`,
    ".br",
    `.B ${quoted("git forest [options] [command]")}`,
    ".br",
    `.B ${quoted("git workforest [options] [command]")}`,
    ".SH DESCRIPTION",
    escapeRoff(description),
    ".PP",
    "Workforest manages one clone as a structured forest of Git worktrees, with each branch in its own folder.",
    ".SH OPTIONS",
  ];

  for (const option of program.options) {
    lines.push(...renderOption(option));
  }
  lines.push(
    ".TP",
    `.B ${quoted("-h, --help")}`,
    "display help for command",
    ".SH COMMANDS",
  );

  for (const command of program.commands) {
    lines.push(...renderCommand(command));
  }
  lines.push(
    ".TP",
    `.B ${quoted("help [command]")}`,
    "display help for command",
    ".SH EXAMPLES",
    ".nf",
    escapeRoff(examples.replace(/^\n/, "").trimEnd()),
    ".fi",
    ".SH REPORTING BUGS",
    escapeRoff("Report issues at https://github.com/dwmkerr/git-workforest/issues."),
    ".SH SEE ALSO",
    ".BR git (1),",
    ".BR git\\-worktree (1)",
  );

  return `${lines.join("\n")}\n`;
}

export function renderAliasManPage(): string {
  return ".so man1/workforest.1\n";
}

export function renderManPages(
  program: Command,
  examples: string,
): Record<(typeof manPageFiles)[number], string> {
  const primary = renderPrimaryManPage(program, examples);
  const alias = renderAliasManPage();

  return {
    "workforest.1": primary,
    "git-forest.1": alias,
    "git-workforest.1": alias,
  };
}
