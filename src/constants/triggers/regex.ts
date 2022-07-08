import type { Trigger } from ".";
import { escapeInlineCode } from "discord.js";
import { matchRegex } from "../../utils/regex";
import properties from "../properties";

const regex: Trigger<[string]> = {
  name: "Regex match",
  description: "This will get triggered when a successful count message matches a regex.",
  properties: [properties.regex],
  supports: ["flows", "notifications"],
  explanation: ([regexString]) => `When a successful counting message matches the regex \`${escapeInlineCode(regexString)}\``,
  check: async ({ message: originalMessage }, [regexString]) => Boolean(await matchRegex(regexString, originalMessage.content)),
};

export default regex;
