import type { GuildMember, Webhook } from "discord.js";
import { Message, TextChannel } from "discord.js";
import type { CountingChannelAllowedChannelType } from "../../../constants/discord";

const webhookCache = new Map<TextChannel, Webhook>();

export default async function repostWithWebhook(message: Message & Message<true>, member: GuildMember, secondTry = false): Promise<Message> {
  const channel = message.channel as CountingChannelAllowedChannelType;

  // if the channel is a thread then get the parent channel
  const textChannel = channel instanceof TextChannel ? channel : channel.parent as TextChannel;

  let webhook = webhookCache.get(textChannel);
  if (!webhook) {
    const webhooks = await textChannel.fetchWebhooks();
    webhook = webhooks.find(wh => wh.name === "Countr") ?? await textChannel.createWebhook({ name: "Countr", avatar: message.client.user?.avatar ?? null });
    webhookCache.set(textChannel, webhook);
  }

  const webhookMessage = await webhook.send({
    content: message.content,
    username: member.displayName,
    avatarURL: member.avatarURL({ forceStatic: false, size: 64 }) ?? member.user.defaultAvatarURL,
    allowedMentions: { parse: [], roles: [], users: []},
    ...channel.isThread() && { threadId: channel.id },
  }).catch(() => {
    // if it fails then assume the webhook is broken and delete it. if it's the second try however, just skip it.
    if (secondTry) return message;
    webhookCache.delete(textChannel);
    return repostWithWebhook(message, member, true);
  });

  return webhookMessage instanceof Message ? webhookMessage : channel.messages.fetch(webhookMessage.id).catch(() => message);
}
