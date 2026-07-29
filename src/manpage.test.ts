import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createRequire } from "module";
import { helpExamples, program } from "./cli.js";
import {
  manPageFiles,
  renderAliasManPage,
  renderManPages,
  renderPrimaryManPage,
} from "./manpage.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

describe("man pages", () => {
  it("renders the shipped CLI commands, aliases, options, and examples", () => {
    const manPage = renderPrimaryManPage(program, helpExamples);

    expect(manPage).toContain("workforest, git\\-forest, git\\-workforest");
    expect(manPage).toContain("clone [options] <repo>");
    expect(manPage).toContain("add|checkout <branch> [gitArgs...]");
    expect(manPage).toContain("list|status|ls");
    expect(manPage).toContain("remove|delete [options] <branch> [gitArgs...]");
    expect(manPage).toContain("\\-f, \\-\\-force");
    expect(manPage).toContain("git forest init");
  });

  it("uses the canonical page for executable aliases", () => {
    expect(renderAliasManPage()).toBe(".so man1/workforest.1\n");
  });

  it("keeps checked-in pages synchronized with the CLI model", () => {
    const rendered = renderManPages(program, helpExamples);

    for (const filename of manPageFiles) {
      const checkedIn = readFileSync(resolve("man", filename), "utf8");
      expect(checkedIn, filename).toBe(rendered[filename]);
    }
  });

  it("declares every manual page in the npm package", () => {
    expect(packageJson.man).toEqual(
      manPageFiles.map((filename) => `./man/${filename}`),
    );
    expect(packageJson.files).toContain("man");
    expect(packageJson.files).toContain("scripts/generate-manpages.mjs");
  });
});
