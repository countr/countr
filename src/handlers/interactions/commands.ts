import { ApplicationCommandSubCommand, ApplicationCommandSubGroup, CommandInteraction, CommandInteractionOption, CommandInteractionOptionResolver, GuildMember } from "discord.js";
import { SelectedCountingChannel, defaultExpirationValue, selectedCountingChannels } from "../../constants/selectedCountingChannels";
import { getPermissionLevel, ladder } from "../../constants/permissions";
import { GuildDocument } from "../../database/models/Guild";
import { SlashCommand } from "../../types/command";
import commandPermissions from "../../commands/slash/_permissions";
import config from "../../config";

// eslint-disable-next-line complexity
export default async (interaction: CommandInteraction, document: GuildDocument): Promise<void> => {
  if (!interaction.guild) return;
  const commands = config.guild ? interaction.client.guilds.cache.get(config.guild)?.commands : interaction.client.application?.commands;
  const command = commands?.cache.find(c => c.name === interaction.commandName);

  if (command) {
    const member = interaction.member && interaction.member instanceof GuildMember ? interaction.member : await interaction.guild?.members.fetch(interaction.user.id);
    const permissionLevel = member ? getPermissionLevel(member) : 0;

    if (permissionLevel < ladder[commandPermissions[command.name] || "ALL"]) {
      return interaction.reply({
        content: "⛔ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const path = [command.name];

    const subCommandOrGroup = command.options.find(o => ["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(o.type) && o.name === interaction.options.data[0].name) as ApplicationCommandSubCommand | ApplicationCommandSubGroup;
    if (subCommandOrGroup) {
      path.push(subCommandOrGroup.name);
      if (subCommandOrGroup.type === "SUB_COMMAND_GROUP") {
        const subCommands = subCommandOrGroup.options as Array<ApplicationCommandSubCommand>;
        const subCommand = subCommands.find(o => o.name === interaction.options.data[0]?.options?.[0].name);
        if (subCommand) path.push(subCommand.name);
      }
    }

    const commandFile = (await import(`../../commands/slash/${path.join("/")}`)).default as SlashCommand;

    const inCountingChannel = document.channels.has(interaction.channelId) || false;
    if (commandFile.disableInCountingChannel && inCountingChannel) {
      return interaction.reply({
        content: "❌ This command is disabled in counting channels.",
        ephemeral: true,
      });
    }

    let selectedCountingChannel: SelectedCountingChannel | undefined = inCountingChannel ?
      {
        channel: interaction.channelId,
      } :
      selectedCountingChannels.get([interaction.guildId, interaction.user.id].join("."));

    if (selectedCountingChannel && (
      selectedCountingChannel.expires && selectedCountingChannel.expires < Date.now() ||
      !document.channels.has(selectedCountingChannel.channel) // check if channel is deleted
    )) {
      selectedCountingChannel = undefined;
      selectedCountingChannels.delete([interaction.guildId, interaction.user.id].join("."));
    }

    if (commandFile.requireSelectedCountingChannel && (
      !selectedCountingChannel ||
      selectedCountingChannel.expires && selectedCountingChannel.expires < Date.now()
    )) {
      if (document.channels.size === 1) {
        selectedCountingChannel = {
          channel: document.channels.keys().next().value,
          expires: Date.now() + defaultExpirationValue,
        };
      } else {
        return interaction.reply({
          content: "💥 You need a counting channel selected to run this command. Type `/select` to select a counting channel and then run this command again.",
          ephemeral: true,
        });
      }
      selectedCountingChannels.set([interaction.guildId, interaction.user.id].join("."), selectedCountingChannel);
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
