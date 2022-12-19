import type{ Client, Message, PartialMessage } from "discord.js";
import config from "../config";
import { inspect } from "util";
import { mainLogger } from "../utils/logger/main";
import { randomBytes } from "crypto";
import superagent from "superagent";

export default function handleAutomaticTokenReset(client: Client<true>): void {
  if (!config.github?.token || !config.github.tokenreset.repo || !config.github.tokenreset.committer.name || !config.github.tokenreset.committer.email) return;

  client.on("messageCreate", message => reportTokensFromMessage(message));
  client.on("messageUpdate", (_, message) => reportTokensFromMessage(message));
}

const tokenRegex = /[a-zA-Z0-9_-]{23,28}\.[a-zA-Z0-9_-]{6,7}\.[a-zA-Z0-9_-]{27,38}/gmu;

function reportTokensFromMessage(message: Message | PartialMessage): void {
  const content = [message.content, message.cleanContent].join(" ");
  const tokens = [...content.matchAll(tokenRegex)].map(match => match[0]!).filter((token, index, arr) => Boolean(token) && arr.indexOf(token) === index);
  if (tokens.length) {
    void superagent
      .put(`https://api.github.com/repos/${config.github!.tokenreset.repo}/contents/${message.id}-${randomBytes(16).toString("hex")}.txt`)
      .set("User-Agent", "Discord Token Resetter (promise.solutions)")
      .set("Accept", "application/vnd.github+json")
      .set("Authorization", `Bearer ${config.github!.token}`)
      .set("X-GitHub-Api-Version", "2022-11-28")
      .send({
        branch: "tokens",
        message: `${tokens.length === 1 ? "Token" : `${tokens.length} tokens`} found in ${message.guild?.name ?? "DMs"} sent by ${message.author ? `${message.author.tag} (${message.author.id})` : "N/A"}`,
        content: Buffer.from(tokens.join("\n")).toString("base64"),
        committer: config.github!.tokenreset.committer,
      })
      .then(res => {
        if (res.ok) mainLogger.info(`Reset ${tokens.length === 1 ? "token" : `${tokens.length} tokens`} found in ${message.guild?.name ?? "DMs"} sent by ${message.author ? `${message.author.tag} (${message.author.id})` : "N/A"}`);
        else mainLogger.warn(`Resetting token failed: ${inspect(res)}`);
      });
  }
}
