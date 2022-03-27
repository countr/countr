/* eslint-disable @typescript-eslint/no-var-requires */
import { join } from "path";
import { readdirSync } from "fs";

const commandPaths: Array<string> = [];
for (const relativePath of ["../src/commands/menu"]) { // expandable
  const files = readdirSync(join(__dirname, relativePath));
  for (const file of files) if (!file.startsWith("_") && file !== "index.ts") commandPaths.push(`${relativePath}/${file}`);
}

test.each(commandPaths)("test %s", (relativePath: string) => {
  expect(relativePath.split("/").pop()?.replace(".ts", "")).toMatch(/^.{1,32}$/);
});
