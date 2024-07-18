import { inspect } from "util";
import type { GuildMember, Message, Snowflake, Webhook } from "discord.js";
import { TextChannel } from "discord.js";
import type { CountingChannelAllowedChannelType, CountingChannelRootChannel } from "../../../constants/discord";
import countingLogger from "../../../utils/logger/counting";

const webhookCache = new Map<Snowflake, Webhook>();

export default async function repostWithWebhook(message: Message<true>, member: GuildMember, secondTry = false): Promise<Message> {
  const channel = message.channel as CountingChannelAllowedChannelType;

  // if the channel is a thread then get the parent channel
  const textChannel = channel instanceof TextChannel ? channel : channel.parent as CountingChannelRootChannel;

  let webhook = webhookCache.get(textChannel.id);
  if (!webhook) {
    const webhooks = await textChannel.fetchWebhooks();
    webhook = webhooks.find(wh => wh.name === "Countr") ?? await textChannel.createWebhook({ name: "Countr", avatar: message.guild.members.me?.displayAvatarURL({ forceStatic: false, size: 64 }) ?? null });
    webhookCache.set(textChannel.id, webhook);
  }

  return webhook.send({
    content: message.content,
    username: member.displayName == "everyone" || "here" ? member.user.username : member.displayName,
    avatarURL: member.displayAvatarURL({ forceStatic: false, size: 64 }),
    allowedMentions: { parse: [], roles: [], users: [] },
    ...channel.isThread() && { threadId: channel.id },
  }).catch((err: unknown) => {
    // if it fails then assume the webhook is broken and delete it. if it's the second try however, just skip it.
    if (secondTry) return message;
    countingLogger.error(`Failed to repost (webhook) message ${message.id}, channel ${message.channel.id}, guild ${message.guild.id}, member ${message.author.id}: ${inspect(err)}`);
    webhookCache.delete(textChannel.id);
    return repostWithWebhook(message, member, true);
  });
}
