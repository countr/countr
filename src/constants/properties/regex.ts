import { escapeInlineCode } from "discord.js";
import type { Property } from ".";
import { regexHelpUrl } from "../links";
import { shortInput } from "./inputs";

const regex: Property<string> = {
  name: "Regular expression",
  description: `Get help on how to create a regex [here](${regexHelpUrl}).`,
  schema: { type: "string" },
  input: shortInput("regular expression"),
  convert: userInput => {
    try {
      RegExp(userInput, "u");
      return userInput;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return null;
    }
  },
  format: expression => `\`${escapeInlineCode(expression)}\``,
};

export default regex;
