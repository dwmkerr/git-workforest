import { describe, it, expect } from "vitest";
import { program } from "./cli.js";

describe("cli command registration", () => {
  describe("list command", () => {
    const listCmd = program.commands.find((c) => c.name() === "list");

    it("is registered", () => {
      expect(listCmd).toBeDefined();
    });

    it("registers both 'status' and 'ls' as aliases", () => {
      expect(listCmd?.aliases()).toEqual(
        expect.arrayContaining(["status", "ls"]),
      );
    });
  });

  describe("--help output", () => {
    it("shows all aliases (not just the first) for subcommands", () => {
      const helpText = program.helpInformation();
      // The subcommand summary should list every alias, not just the first.
      expect(helpText).toContain("list|status|ls");
    });
  });
});
