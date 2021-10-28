import { Message } from "discord.js";
import fs from "fs";
import { join } from "path";
import permissions from "../commands/mention/_permissions";
import config from "../config";
import { getPermissionLevel, ladder } from "../constants/permissions";
import { GuildDocument } from "../database/models/Guild";
import { MentionCommand } from "../types/command";

export default async (message: Message, document: GuildDocument): Promise<void> => {
  const args = message.content.split(" ").slice(1);
  const commandOrAlias = (args.shift() || "").toLowerCase();
  const commandName = aliases.get(commandOrAlias) || commandOrAlias;

  const command = commands.get(commandName);
  const inCountingChannel = document.channels.has(message.channel.id);

  if (!command) return message.react("❓").then(() => {
    if (inCountingChannel) setTimeout(message.delete, 5000);
  }).catch();

  return new Promise<Message>(resolve => {
    if (!message.guild) return; // typescript. guild will always be defined

    try {
      if (inCountingChannel && command.disableInCountingChannel) {
        message.react("💢").catch();
        return resolve(message);
      }

      message.guild.members.fetch(message.author).then(member => {
        const permissionLevel = getPermissionLevel(member);
        if (permissionLevel < ladder[permissions[commandName]]) {
          message.react("⛔").catch();
          return resolve(message);
        }

        if (args.length < (command.minArguments || 0)) {
          message.react("📏").catch();
          return resolve(message);
        }

        return command.execute(message, args, document).then(resolve);
      });
    } catch (e) {
      console.log(e);
      message.react("💥").catch();
      return resolve(message);
    }
  }).then(response => {
    if (inCountingChannel) setTimeout(() => {
      // re-check if the channel is still a counting channel
      if (document.channels.has(message.channel.id)) console.log("todo delete"); // todo
    }, 5000);
  });
};

// loading commands
const commands = new Map<string, MentionCommand>(), aliases = new Map<string, string>();
fs.readdir(join(__dirname, "../commands/mention"), async (err, files) => {
  if (err || !files) return console.log(err);
  for (const file of files) if (file.endsWith(".js") && !file.startsWith("_")) loadCommand(file.replace(".js", ""));
});

const loadCommand = async (command: string): Promise<void> => {
  const commandFile: MentionCommand = (await import(`../commands/mention/${command}`)).default;
  if (!commandFile.premiumOnly || config.isPremium) {
    commands.set(command, commandFile);
    if (commandFile.aliases) for (const alias of commandFile.aliases) aliases.set(alias, command);
  }
};

export const reloadCommand = (command: string): void => {
  delete require.cache[require.resolve(`../commands/mention/${command}`)];
  loadCommand(command);
};
