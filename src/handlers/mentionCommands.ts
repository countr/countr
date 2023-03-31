import { readdir } from "fs/promises";
import { join } from "path";
import { inspect } from "util";
import type { Message, MessageEditOptions, MessageReplyOptions, Snowflake } from "discord.js";
import { escapeInlineCode } from "discord.js";
import type { MentionCommand } from "../commands/mention";
import { quickResponses } from "../commands/mention";
import config from "../config";
import { DebugCommandLevel } from "../constants/permissions";
import { selectedCountingChannels } from "../constants/selectedCountingChannel";
import type { CountingChannelSchema, GuildDocument } from "../database/models/Guild";
import commandsLogger from "../utils/logger/commands";
import { fitText } from "../utils/text";
import { queueDelete } from "./counting";

const replies = new Map<Snowflake, Message>();
const commands = new Map<string, MentionCommand>();
const aliases = new Map<string, string>();

export default function mentionCommandHandler(message: Message<true>, document: GuildDocument): void {
  const existingReply = replies.get(message.id);
  if (!existingReply && message.editedTimestamp) return;

  return void handleCommand(message, document, existingReply)
    .then(messages => { if (document.channels.has(message.channelId)) queueDelete(messages); })
    .catch(err => commandsLogger.debug(`Error handling mention command from message ${message.url}, member ${message.author.id}: ${inspect(err)}`));
}

// eslint-disable-next-line complexity
async function handleCommand(message: Message<true>, document: GuildDocument, existingReply?: Message): Promise<Message[]> {
  const args = message.content.split(" ").slice(1);
  const commandOrAlias = (args.shift() ?? "").toLowerCase();

  const quickResponse = quickResponses.find(([triggers]) => triggers.includes(commandOrAlias));
  if (quickResponse) return reply(quickResponse[1], message, existingReply).then(newReply => [message, newReply]);

  const commandName = aliases.get(commandOrAlias) ?? commandOrAlias;
  const command = commands.get(commandName);
  const inCountingChannel = document.channels.has(message.channelId);

  if (!command) return reply(`❓ Command \`${escapeInlineCode(fitText(commandName, 20))}\` not found.`, message, existingReply).then(newReply => [message, newReply]);
  if (inCountingChannel && command.disableInCountingChannel) return reply(`❓ Command \`${commandName}\` is disabled in counting channels. Try this in another channel.`, message, existingReply).then(newReply => [message, newReply]);

  if (
    command.debugLevel === DebugCommandLevel.Owner && config.owner !== message.author.id ||
    command.debugLevel === DebugCommandLevel.Admin && !config.admins.includes(message.author.id)
  ) return reply("⛔ This command is not available.", message, existingReply).then(newReply => [message, newReply]);

  const selectedCountingChannelId = inCountingChannel ? message.channelId : selectedCountingChannels.get(message.author.id)?.channel;
  const selectedCountingChannel: [Snowflake, CountingChannelSchema] | null = selectedCountingChannelId ? [selectedCountingChannelId, document.channels.get(selectedCountingChannelId)!] : document.getDefaultCountingChannel();

  if (command.requireSelectedCountingChannel && !selectedCountingChannel) return reply("💥 You need a counting channel selected to run this command. Type `/select` to select a counting channel and then run this command again.", message, existingReply).then(newReply => [message, newReply]);

  if (!command.testArgs(args)) return reply("❓ Invalid arguments provided.", message, existingReply).then(newReply => [message, newReply]);

  return [message, await command.execute(message, options => reply(options, message, existingReply), args, document, (selectedCountingChannel ?? [null, null]) as never)];
}

async function reply(optionsOrContent: string | MessageEditOptions & MessageReplyOptions, message: Message, existingReply?: Message): Promise<Message> {
  const options: MessageEditOptions & MessageReplyOptions = {
    allowedMentions: { repliedUser: true },
    components: [],
    embeds: [],
    files: [],
    ...typeof optionsOrContent === "string" ? { content: optionsOrContent } : optionsOrContent,
  };
  if (existingReply) return existingReply.edit({ content: null, ...options });
  const newReply = await message.reply(options);
  replies.set(message.id, newReply);
  return newReply;
}

// loading commands
readdir(join(__dirname, "../commands/mention")).then(async files => {
  for (const fileName of files.filter(file => file.includes(".") && !file.startsWith("_") && file !== "index.js")) {
    const { default: command } = await import(`../commands/mention/${fileName}`) as { default: MentionCommand };
    if (!command.premiumOnly || config.isPremium) {
      const commandName = fileName.split(".")[0]!.toLowerCase();
      commands.set(commandName, command);
      if (command.aliases) for (const alias of command.aliases) aliases.set(alias, commandName);
    }
  }
})
  .catch(err => commandsLogger.error(`Failed to load mention commands: ${inspect(err)}`));
