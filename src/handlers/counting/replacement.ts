import type { Message, PartialMessage } from "discord.js";
import numberSystems from "../../constants/numberSystems";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";

export default async function replaceUpdatedOrDeletedMessage(message: Message | PartialMessage, document: GuildDocument, countingChannel: CountingChannelSchema, isDeleted: boolean): Promise<void> {
  const ownerId = message.author?.id ?? message.member?.id ?? countingChannel.count.userId ?? null;
  if (ownerId !== countingChannel.count.userId) return;

  const newNumber = numberSystems[countingChannel.type].convert(toString(countingChannel.count.number));
  const newMessage = await message.channel.send(`*<@${ownerId}>: ${newNumber}*`);
  if (countingChannel.count.messageId === message.id) {
    countingChannel.count.messageId = newMessage.id;
    document.safeSave();
  }

  if (!isDeleted) void message.delete();
}
