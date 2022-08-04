import { ApplicationCommandOptionType } from "discord.js";
import type { ChatInputCommand } from "..";
import { msToHumanTime } from "../../../utils/time";

const command: ChatInputCommand = {
  description: "Set the timeout role",
  considerDefaultPermission: false,
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description: "The role you want as the timeout role",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "fails",
      description: "The number of fails before the timeout role is applied",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "seconds",
      description: "The number of seconds before the fail counter resets",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "duration",
      description: "The number of seconds the timeout role is applied. Leave blank for infinite",
    },
  ],
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const role = interaction.options.getRole("role", true);
    const fails = interaction.options.getInteger("fails", true);
    const timeout = interaction.options.getInteger("seconds", true);
    const duration = interaction.options.getInteger("duration");

    countingChannel.timeoutRole = { roleId: role.id, fails, timeout, ...duration && { duration }};

    document.safeSave();

    return void interaction.reply({
      content: `✅ The timeout role of <#${countingChannelId}> has been set to ${role.toString()}. It will be given out if someone fails ${fails} times within ${msToHumanTime(timeout * 1000)}. ${duration ? `The role will be removed after ${msToHumanTime(duration * 1000)}.` : ""}`,
      ephemeral,
    });
  },
};

export default { ...command } as ChatInputCommand;
