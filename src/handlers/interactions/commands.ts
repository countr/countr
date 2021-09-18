import { CommandInteraction, CommandInteractionOption, CommandInteractionOptionResolver, GuildMember } from "discord.js";
import config from "../../../config";
import { getPermissionLevel, ladder } from "../../constants/permissions";
import commandPermissions from "../../commands/slash/_permissions";
import { SlashCommand } from "../../commands/command";
import { GuildDocument } from "../../database/models/Guild";

export default async (interaction: CommandInteraction, document?: GuildDocument): Promise<void> => {
  if (!interaction.guild && config.guild) return; // todo reply with error
  const commands = config.guild ? interaction.client.guilds.cache.get(config.guild)?.commands : interaction.client.application?.commands;
  const command = commands?.cache.find(c => c.name == interaction.commandName);

  if (command) {
    const member = (interaction.member && interaction.member instanceof GuildMember) ? interaction.member : await interaction.guild?.members.fetch(interaction.user.id);
    const permissionLevel = member ? getPermissionLevel(member) : 0;

    if (permissionLevel < ladder[commandPermissions[command.name] || "ALL"]) return; // todo reply with error

    const path = [ command.name ];

    const subCommandOrGroup = command.options.find(o => o.type == "SUB_COMMAND" || o.type == "SUB_COMMAND_GROUP");
    if (subCommandOrGroup) {
      path.push(subCommandOrGroup.name);
      const subCommand = subCommandOrGroup.options?.find(o => o.type == "SUB_COMMAND");
      if (subCommand) path.push(subCommand.name);
    }

    const commandFile = await import(`../../commands/slash/${path.join("/")}`) as SlashCommand; // todo
    if (!commandFile.workInDms && !interaction.guild) return; // todo reply with error
    commandFile.execute(interaction, document?.channels.has(interaction.channelId) || false, getSlashArgs(interaction.options.data), document);
  }
};

export type SlashArgRecord = {
  [key: string]: CommandInteractionOption["value"]
};

function getSlashArgs(options: CommandInteractionOptionResolver["data"]): SlashArgRecord {
  if (!options[0]) return {};
  if (options[0].options) return getSlashArgs(options[0].options);
  else {
    const args: SlashArgRecord = {};
    for (const o of options) args[o.name] = o.value;
    return args;
  }
}