#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

process.env.VITEST = process.env.VITEST ?? "manpage-generator";

const [{ helpExamples, program }, { manPageFiles, renderManPages }] =
  await Promise.all([
    import("../dist/cli.js"),
    import("../dist/manpage.js"),
  ]);

const check = process.argv.includes("--check");
const manDir = resolve("man");
const pages = renderManPages(program, helpExamples);
let stale = false;

if (!check) {
  await mkdir(manDir, { recursive: true });
}

for (const filename of manPageFiles) {
  const path = resolve(manDir, filename);
  const expected = pages[filename];

  if (check) {
    let actual;
    try {
      actual = await readFile(path, "utf8");
    } catch {
      actual = undefined;
    }

    if (actual !== expected) {
      console.error(`stale man page: ${filename}`);
      stale = true;
    }
  } else {
    await writeFile(path, expected, "utf8");
    console.log(`generated man/${filename}`);
  }
}

if (stale) {
  console.error("run npm run man to regenerate manual pages");
  process.exitCode = 1;
}
