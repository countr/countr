import type { GuildMember, Message, Snowflake } from "discord.js";
import { ChannelType } from "discord.js";
import type { CountingChannelAllowedChannelType, CountingChannelRootChannel } from "../../constants/discord";
import { bulkDeleteDelay, calculatePermissionsForChannel, messagesPerBulkDeletion } from "../../constants/discord";
import numberSystems from "../../constants/numberSystems";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import { addToCount } from "../../utils/cluster";
import checkBypass from "./bypass";
import { handleFlows, handleFlowsOnFail } from "./flows";
import handleNotifications from "./notifications";
import handlePositionRoles from "./positionRoles";
import checkRegex from "./regex";
import repostMessage from "./repost";
import handleTimeouts from "./timeouts";

export interface CountingData {
  channel: CountingChannelAllowedChannelType;
  count: number;
  countingChannel: CountingChannelSchema;
  countingMessage: Message;
  document: GuildDocument;
  failReason?: string;
  member: GuildMember;
  message: Message<true>;
}

export default async function countingHandler(message: Message<true>, document: GuildDocument, countingChannel: CountingChannelSchema): Promise<void> {
  const member = message.member ?? await message.guild.members.fetch(message.author);
  const channel = message.channel as CountingChannelAllowedChannelType;

  // step 1, check if the user can bypass
  if (message.content.startsWith("!") && checkBypass(member, countingChannel.bypassableRoles)) return;

  // step 2, convert number
  const input = countingChannel.modules.includes("talking") ? message.content.split(/<|:| /u)[0]! : message.content;
  const converted = numberSystems[countingChannel.type].convert(input);

  // step 3, handle if it's invalid
  if (
    converted !== countingChannel.count.number + countingChannel.increment ||
    !countingChannel.modules.includes("spam") && message.author.id === countingChannel.count.userId ||
    await checkRegex(message.content, countingChannel.filters)
  ) {
    const countingData: CountingData = {
      channel,
      count: countingChannel.count.number + countingChannel.increment,
      countingChannel,
      countingMessage: message,
      document,
      failReason: [
        converted !== countingChannel.count.number + countingChannel.increment && "Invalid count",
        !countingChannel.modules.includes("spam") && message.author.id === countingChannel.count.userId && "User counted twice in a row",
        // we don't want to check for regex again here, either it's one of the above or it's a regex match
        "Message matched a regex filter",
      ].find(Boolean)! as string,
      member,
      message,
    };
    void Promise.all([
      handleFlowsOnFail(countingData),
      handleTimeouts(countingData),
    ]).then(() => void handlePositionRoles(countingData));
    if (!countingChannel.modules.includes("nodelete")) queueDelete([message]);
    return;
  }

  // step 4, partially update the database cache with new information
  countingChannel.count = {
    number: converted,
    userId: message.author.id,
    messageId: message.id,
  };
  countingChannel.scores.set(message.author.id, (countingChannel.scores.get(message.author.id) ?? 0) + 1);
  addToCount(1);

  // step 5, repost if configured to do so
  const countingMessage = await repostMessage(message, member, countingChannel);
  if (countingMessage !== message) queueDelete([message]);

  // step 6, update the database and save
  countingChannel.count.messageId = countingMessage.id;
  document.safeSave();

  // step 7, handle notifications, flows and position roles
  const countingData: CountingData = { channel, count: converted, countingChannel, countingMessage, document, member, message };
  void handleNotifications(countingData);
  void handleFlows(countingData).then(() => void handlePositionRoles(countingData));
}

const bulks = new Map<Snowflake, Message[]>();
export function queueDelete(messages: Message[]): void {
  if (!messages.length) return;
  const channel = messages[0]!.channel as CountingChannelAllowedChannelType;

  const bulk = bulks.get(channel.id);
  if (!bulk && messages.length === 1) {
    void channel.guild.members.fetchMe().then(me => {
      const currentPermissions = calculatePermissionsForChannel(channel.type === ChannelType.GuildText ? channel : channel.parent as CountingChannelRootChannel, me);
      if (currentPermissions.has("ManageMessages")) void messages[0]?.delete();
    });
    bulks.set(channel.id, []);
  } else if (bulk) return void bulk.push(...messages);
  else bulks.set(channel.id, messages);

  return void setTimeout(() => void bulkDelete(channel), bulkDeleteDelay);
}

async function bulkDelete(channel: CountingChannelAllowedChannelType): Promise<void> {
  const currentPermissions = calculatePermissionsForChannel(channel.type === ChannelType.GuildText ? channel : channel.parent as CountingChannelRootChannel, await channel.guild.members.fetchMe({ force: false }));
  if (!currentPermissions.has("ManageMessages")) return void bulks.delete(channel.id);

  const bulk = bulks.get(channel.id);
  if (!bulk?.length) return void bulks.delete(channel.id);

  if (bulk.length > 1) void channel.bulkDelete(bulk.slice(0, messagesPerBulkDeletion));
  else void bulk[0]!.delete();

  const newBulk = bulk.slice(messagesPerBulkDeletion);
  if (!newBulk.length) return void bulks.delete(channel.id);

  bulks.set(channel.id, newBulk);
  return void setTimeout(() => void bulkDelete(channel), bulkDeleteDelay);
}
