import type { Awaitable, GuildMember, Message } from "discord.js";
import type { CountingChannelSchema } from "../../../database/models/Guild";
import repostWithEmbed from "./embed";
import repostWithReposting from "./reposting";
import repostWithWebhook from "./webhook";

export default function repostMessage(message: Message<true>, member: GuildMember, countingChannel: CountingChannelSchema): Awaitable<Message> {
  if (countingChannel.modules.includes("embed")) return repostWithEmbed(message);
  if (countingChannel.modules.includes("reposting")) return repostWithReposting(message);
  if (countingChannel.modules.includes("webhook")) return repostWithWebhook(message, member);
  return message;
}
