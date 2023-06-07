import { escapeCodeBlock } from "discord.js";
import { paragraphInput } from "./inputs";
import type { Property } from ".";

const text: Property<string> = {
  name: "Text",
  description: [
    "Any text. Get creative with these placeholders:",
    "• `{count}` The count that triggered this flow",
    "• `{mention}` Mentions the user who triggered this flow",
    "• `{tag}` The tag of the user who triggered this flow",
    "• `{username}` The username of the user who triggered this flow",
    "• `{nickname}` The nickname of the user who triggered this flow",
    "• `{everyone}` Mentions the everyone-role",
    "• `{score}` The new score of the user who triggered this flow",
    "• `{content}` The content of the message that triggered this flow",
  ].join("\n"),
  schema: { type: "string", minLength: 1, maxLength: 2000 },
  input: paragraphInput("text", 1, 2000),
  convert: userInput => userInput,
  format: userInput => `\`\`\`\n${escapeCodeBlock(userInput)}\`\`\``,
};

export default text;
