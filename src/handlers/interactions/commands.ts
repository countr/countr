import { ApplicationCommandSubCommand, ApplicationCommandSubGroup, CommandInteraction, CommandInteractionOption, CommandInteractionOptionResolver, GuildMember } from "discord.js";
import { SelectedCountingChannel, selectedCountingChannels } from "../../constants/selectedCountingChannels";
import { getPermissionLevel, ladder } from "../../constants/permissions";
import { GuildDocument } from "../../database/models/Guild";
import { SlashCommand } from "../../types/command";
import commandPermissions from "../../commands/slash/_permissions";
import config from "../../config";

// eslint-disable-next-line complexity
export default async (interaction: CommandInteraction, document: GuildDocument): Promise<void> => {
  if (!interaction.guild && config.guild) return; // todo reply with error
  const commands = config.guild ? interaction.client.guilds.cache.get(config.guild)?.commands : interaction.client.application?.commands;
  const command = commands?.cache.find(c => c.name === interaction.commandName);

  if (command) {
    const member = interaction.member && interaction.member instanceof GuildMember ? interaction.member : await interaction.guild?.members.fetch(interaction.user.id);
    const permissionLevel = member ? getPermissionLevel(member) : 0;

    if (permissionLevel < ladder[commandPermissions[command.name] || "ALL"]) return; // todo reply with error

    const path = [command.name];

    const subCommandOrGroup = command.options.find(o => o.type === "SUB_COMMAND" || o.type === "SUB_COMMAND_GROUP") as ApplicationCommandSubCommand | ApplicationCommandSubGroup;
    if (subCommandOrGroup) {
      path.push(subCommandOrGroup.name);
      if (subCommandOrGroup.options) {
        const subCommands = subCommandOrGroup.options as Array<ApplicationCommandSubCommand>;
        const subCommand = subCommands.find(o => o.type === "SUB_COMMAND");
        if (subCommand) path.push(subCommand.name);
      }
    }

    const commandFile = (await import(`../../commands/slash/${path.join("/")}`)).default as SlashCommand; // todo

    const inCountingChannel = document.channels.has(interaction.channelId) || false;
    if (commandFile.disableInCountingChannel && inCountingChannel) return; // todo reply with error

    let selectedCountingChannel: SelectedCountingChannel | undefined = inCountingChannel ?
      {
        channel: interaction.channelId,
        expires: Date.now(),
      } :
      selectedCountingChannels.get(interaction.user.id);

    if (selectedCountingChannel && selectedCountingChannel.expires < Date.now()) {
      selectedCountingChannel = undefined;
      selectedCountingChannels.delete(interaction.user.id);
    }

    if (commandFile.requireSelectedCountingChannel && (
      !selectedCountingChannel ||
      selectedCountingChannel.expires < Date.now()
    )) {
      if (document.channels.size === 1) selectedCountingChannel = { channel: document.channels.values().next().value, expires: Date.now() + 1000 * 60 * 60 * 24 };
      else if (document.channels.has(interaction.channelId)) selectedCountingChannel = { channel: interaction.channelId, expires: Date.now() + 1000 * 60 * 60 * 24 };
      else {
        return interaction.reply({
          content: "💥 You need a counting channel selected to run this command. Type `/select` to select a counting channel and then run this command again.",
          ephemeral: true,
        });
      }
      selectedCountingChannels.set(interaction.user.id, selectedCountingChannel);
    }

    commandFile.execute(interaction, inCountingChannel, getSlashArgs(interaction.options.data), document, selectedCountingChannel?.channel);
  }
};

export type SlashArgRecord = {
  [key: string]: CommandInteractionOption["value"]
};

function getSlashArgs(options: CommandInteractionOptionResolver["data"]): SlashArgRecord {
  if (!options[0]) return {};
  if (options[0].options) return getSlashArgs(options[0].options);

  const args: SlashArgRecord = {};
  for (const o of options) args[o.name] = o.value;
  return args;

}
