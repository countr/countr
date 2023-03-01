import { escapeInlineCode } from "discord.js";
import { regexHelpUrl } from "../links";
import { shortInput } from "./inputs";
import type { Property } from ".";

const regex: Property<string> = {
  name: "Regular expression",
  description: `Get help on how to create a regex [here](${regexHelpUrl}).`,
  schema: { type: "string" },
  input: shortInput("regular expression"),
  convert: userInput => {
    try {
      RegExp(userInput, "u");
      return userInput;
    } catch (err) {
      return null;
    }
  },
  format: expression => `\`${escapeInlineCode(expression)}\``,
};

export default regex;
