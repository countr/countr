import type { CountingChannel, GuildDocument } from "../../database/models/Guild";
import type { GuildMember, Message, TextBasedChannel, TextChannel, ThreadChannel } from "discord.js";
import handleFlows, { onFail as handleFlowsOnFail } from "./flows";
import { addToCount } from "../../utils/cluster/stats";
import { countrLogger } from "../../utils/logger/countr";
import { getPermissionLevel } from "../../constants/permissions";
import handleNotifications from "./notifications";
import handleTimeouts from "./timeout";
import { inspect } from "util";
import numberSystems from "../../constants/numberSystems";
import regexTest from "../../utils/regex";

export type CountingData = {
  channel: TextChannel | ThreadChannel;
  count: number;
  countingChannel: CountingChannel;
  countingMessageId: string;
  document: GuildDocument;
  member: GuildMember;
  message: Message;
  score: number;
};

// eslint-disable-next-line complexity -- it's going to be a pain to refactor this into separate files
export default async (message: Message, document: GuildDocument, countingChannel: CountingChannel): Promise<void> => {
  const member = message.member || await message.guild?.members.fetch(message.author) as GuildMember;
  const channel = message.channel as TextChannel | ThreadChannel;

  const permissionLevel = getPermissionLevel(member);
  const { content } = message;
  if (content.startsWith("!") && permissionLevel >= 1) return; // ignore because staff member bypassed

  const { count, filters, modules, type } = countingChannel;
  const { convert } = numberSystems[type];

  const converted = modules.includes("talking") ? convert(content.split(" ")[0].split("<")[0]) : convert(content);

  let regexMatch = false;
  for (const regex of filters) {
    if (await regexTest(regex, content)) {
      regexMatch = true;
      break;
    }
  }

  // test message and queue for deletion if it matches
  if (
    regexMatch ||
    !converted ||
    !modules.includes("allow-spam") && message.author.id === count.userId ||
    converted !== count.number + 1
  ) {
    const countingData: CountingData = {
      channel,
      count: count.number,
      countingChannel,
      countingMessageId: message.id,
      document,
      member,
      message,
      score: countingChannel.scores.get(member.id) || 0,
    };
    handleTimeouts(countingData);
    handleFlowsOnFail(countingData);

    return queueDelete([message]);
  }

  // update database
  countingChannel.count = {
    number: converted,
    userId: message.author.id,
    messageId: message.id,
  };
  countingChannel.scores.set(message.author.id, (countingChannel.scores.get(message.author.id) || 0) + 1);
  addToCount(1);

  // repost message if enabled
  let countingMessageId = message.id;

  if (modules.includes("embed")) {
    try {
      countingMessageId = await channel.send({
        embeds: [
          {
            description: `${message.author}: ${content}`,
            color: message.member?.displayColor || 3553598,
          },
        ],
      }).then(m => m.id);
      queueDelete([message]);
    } catch (e) {
      countrLogger.verbose(`Failed to replace message ${message.url} with embed module: ${inspect(e)}`);
    }
  } else if (modules.includes("reposting")) {
    try {
      countingMessageId = await channel.send(`${message.author}: ${content}`).then(m => m.id);
      queueDelete([message]);
    } catch (e) {
      countrLogger.verbose(`Failed to replace message ${message.url} with reposting module: ${inspect(e)}`);
    }
  } else if (modules.includes("webhook") && channel.type === "GUILD_TEXT") {
    try {
      const webhooks = await channel.fetchWebhooks();
      const webhook = webhooks.find(webhook => webhook.name === "Countr") || await channel.createWebhook("Countr").catch();

      if (webhook) {
        countingMessageId = await webhook.send({
          content,
          username: member.displayName,
          avatarURL: member.avatarURL({ dynamic: true }) || member.user.defaultAvatarURL,
          allowedMentions: {
            parse: [],
            roles: [],
            users: [],
          },
        }).then(m => m.id);
        queueDelete([message]);
      }
    } catch (e) {
      countrLogger.verbose(`Failed to replace message ${message.url} with webhook module: ${inspect(e)}`);
    }
  }

  if (countingChannel.count.messageId === message.id) countingChannel.count.messageId = countingMessageId;
  document.safeSave();

  const countingData: CountingData = {
    channel,
    count: count.number,
    countingChannel,
    countingMessageId,
    document,
    member,
    message,
    score: countingChannel.scores.get(member.id) || 0,
  };

  handleFlows(countingData);
  handleNotifications(countingData);
};

// bulks is an array of messages waiting to get bulk-deleted. channel id is the key of the map.
const bulks = new Map<string, Array<Message>>();
export function queueDelete(messages: Array<Message>): void {
  if (!messages.length) return;
  const [{ channel }] = messages;

  const bulk = bulks.get(channel.id);
  if (!bulk && messages.length === 1) {
    messages[0].delete();
    bulks.set(channel.id, []); // wait for more
  } else if (bulk) return void bulk.push(...messages);
  else bulks.set(channel.id, [...bulks.get(channel.id) || [], ...messages]);

  setTimeout(() => bulkDelete(channel), 10000);
}

function bulkDelete(channel: TextBasedChannel): void {
  const bulk = bulks.get(channel.id);
  if (bulk?.[0] && ( // typescript
    bulk[0].channel.type === "GUILD_TEXT" ||
    bulk[0].channel.type === "GUILD_PRIVATE_THREAD" ||
    bulk[0].channel.type === "GUILD_PUBLIC_THREAD"
  )) {
    if (bulk.length > 2) bulk[0].channel.bulkDelete(bulk.slice(0, 100));
    else bulk[0].delete();

    const newBulk = bulk.slice(100);

    if (newBulk.length) {
      bulks.set(channel.id, newBulk);
      setTimeout(() => bulkDelete(channel), 10000);
    } else bulks.delete(channel.id);
  }
}
