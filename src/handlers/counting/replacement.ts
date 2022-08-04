import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import type { Message, PartialMessage } from "discord.js";

export async function replaceUpdatedOrDeletedMessage(message: Message | PartialMessage, document: GuildDocument, countingChannel: CountingChannelSchema, isDeleted: boolean): Promise<void> {
  const ownerId = message.author?.id ?? message.member?.id ?? countingChannel.count.userId ?? null;
  if (ownerId !== countingChannel.count.userId) return;

  const newMessage = await message.channel.send(`*<@${ownerId}>: ${countingChannel.count.number}*`);
  if (countingChannel.count.messageId === message.id) {
    countingChannel.count.messageId = newMessage.id;
    document.safeSave();
  }

  if (!isDeleted) void message.delete();
}
