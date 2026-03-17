import type { Message, PartialMessage } from "discord.js";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import numberSystems from "../../constants/numberSystems";

export default async function replaceUpdatedOrDeletedMessage(message: Message | PartialMessage, document: GuildDocument, countingChannel: CountingChannelSchema, isDeleted: boolean): Promise<void> {
  const ownerId = message.author?.id ?? message.member?.id ?? countingChannel.count.userId ?? null;
  if (ownerId !== countingChannel.count.userId) return;

  const newNumber = numberSystems[countingChannel.type].format(countingChannel.count.number);
  const { channel } = message;
  if (!channel.isSendable()) return;
  const newMessage = await channel.send(`*<@${ownerId}>: ${newNumber}*`);
  if (countingChannel.count.messageId === message.id) {
    countingChannel.count.messageId = newMessage.id;
    document.safeSave();
  }

  if (!isDeleted) void message.delete();
}
