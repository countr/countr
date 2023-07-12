import type { APIEmoji } from "discord.js";
import { emojiHelpUrl } from "../links";
import emojiInput from "./inputs/emoji";
import type { Property } from ".";

const emoji: Property<string, APIEmoji> = {
  name: "Emoji",
  description: `Any server emoji or default Discord emoji allowed. Prefix an emoji with a backslash in chat to get the raw emoji. [Learn more](${emojiHelpUrl})`,
  schema: { type: "string" },
  input: emojiInput,
  convert: userInput => userInput.id ? `<${userInput.animated ? "a" : ""}:${userInput.name!}:${userInput.id}>` : userInput.name!,
  format: emojiString => emojiString,
};

export default emoji;
