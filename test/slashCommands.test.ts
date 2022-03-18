/* eslint-disable @typescript-eslint/no-var-requires */
import { lstatSync, readdirSync } from "fs";
import type { ApplicationCommandOptionChoice } from "discord.js";
import type { SlashCommand } from "../src/@types/command";
import { join } from "path";

const commandPaths: Array<string> = [];
function nest(relativePath: string): void {
  const path = join(__dirname, relativePath);
  const filesOrFolders = readdirSync(path);
  for (const fileOrFolder of filesOrFolders) {
    if (lstatSync(join(path, fileOrFolder)).isDirectory()) nest(`${relativePath}/${fileOrFolder}`);
    else if (!fileOrFolder.startsWith("_")) commandPaths.push(`${relativePath}/${fileOrFolder}`);
  }
}
nest("../src/commands/slash");

test.each(commandPaths)("test %s", (relativePath: string) => {
  const commandFile = require(join(__dirname, relativePath)).default as SlashCommand;

  expect(relativePath.split("/").pop()?.replace(".ts", "")).toMatch(/^[\w-]{1,32}$/);
  expect(commandFile.description).toMatch(/^.{1,100}$/);
  expect(commandFile.description.endsWith(".")).toBe(false);
  expect(commandFile.options?.length || 0).toBeLessThanOrEqual(25);

  if (commandFile.options) {
    for (const option of commandFile.options) {
      expect(option.name).toMatch(/^[\w-]{1,32}$/);
      expect(option.description).toMatch(/^.{1,100}$/);
      expect(option.description.endsWith(".")).toBe(false);
      if ("choices" in option) {
        for (const choice of option.choices as Array<ApplicationCommandOptionChoice>) {
          expect(choice.name).toMatch(/^.{1,100}$/);
          if (option.type === "STRING") expect(choice.value).toMatch(/^.{1,100}$/);
          else expect(choice.value).toBeGreaterThanOrEqual(0);
        }
      }
    }
  }
});
