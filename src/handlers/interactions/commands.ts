import { CommandInteraction, CommandInteractionOption, CommandInteractionOptionResolver, GuildMember } from "discord.js";
import config from "../../../config";
import { getPermissionLevel, ladder } from "../../constants/permissions";
import commandPermissions from "../../commands/slash/_permissions";

export default async (interaction: CommandInteraction): Promise<void> => {
  if (!interaction.guild) return; // todo reply with error
  const commands = config.guild ? interaction.client.guilds.cache.get(config.guild)?.commands : interaction.client.application?.commands;
  const command = commands?.cache.find(c => c.name == interaction.commandName);

  if (command) {
    const member = (interaction.member && interaction.member instanceof GuildMember) ? interaction.member : await interaction.guild.members.fetch(interaction.user.id);
    const permissionLevel = getPermissionLevel(member);

    if (permissionLevel < ladder[commandPermissions[command.name] || "ALL"]) return; // todo reply with error

    const args = getSlashArgs(interaction.options.data);
    const path = [ command.name ];

    const subCommandOrGroup = command.options.find(o => o.type == "SUB_COMMAND" || o.type == "SUB_COMMAND_GROUP");
    if (subCommandOrGroup) {
      path.push(subCommandOrGroup.name);
      const subCommand = subCommandOrGroup.options?.find(o => o.type == "SUB_COMMAND");
      if (subCommand) path.push(subCommand.name);
    }

    const commandFile = await import(`../../commands/slash/${path.join("/")}.ts`); // todo
  }
};
type SlashArgRecord = { [key: string]: CommandInteractionOption["value"] | SlashArgRecord };

function getSlashArgs(options: CommandInteractionOptionResolver["data"]): SlashArgRecord { // to get the path as well as the args
  const args: SlashArgRecord = {};
  for (const o of options) {
    args[o.name] = o.options ? getSlashArgs(o.options) : o.value;
  }
  return args;
}

function getActualSlashArgs(options: CommandInteractionOptionResolver["data"]): SlashArgRecord { // sends through to the command files
  if (!options[0]) return {};
  if (options[0].options) return getActualSlashArgs(options[0].options);
  else return getSlashArgs(options);
}