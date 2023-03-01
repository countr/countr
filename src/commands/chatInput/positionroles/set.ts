import { ApplicationCommandOptionType } from "discord.js";
import ordinal from "ordinal";
import type { ChatInputCommand } from "..";
import limits from "../../../constants/limits";
import handlePositionRoles from "../../../handlers/counting/positionRoles";

const command: ChatInputCommand = {
  description: "Set a position role",
  options: [
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description: "The role you want to give out",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "position",
      description: "The scoreboard position you want to give the role out at",
      minValue: 1,
      maxValue: limits.positionRole.max,
      required: true,
    },
  ],
  requireSelectedCountingChannel: true,
  async execute(interaction, ephemeral, document, [countingChannelId, countingChannel]) {
    const role = interaction.options.getRole("role", true);
    const position = interaction.options.getInteger("position", true);

    const me = await interaction.guild.members.fetchMe({ force: false }).catch(() => null);
    if (me && role.comparePositionTo(me.roles.highest) > 0) {
      return void interaction.reply({
        content: "❌ The role must be lower than the bot's highest role.",
        ephemeral: true,
      });
    }

    const roles = Array.from(countingChannel.positionRoles.values());
    if (roles.includes(role.id)) {
      return void interaction.reply({
        content: "❌ This role is already in use for a position.",
        ephemeral: true,
      });
    }

    countingChannel.positionRoles.set(String(position) as `${number}`, role.id);
    countingChannel.metadata.delete(`positionRole-${role.id}`);
    void handlePositionRoles({ countingChannel, document, member: interaction.member });
    // handler saves so we don't need to save here

    return void interaction.reply({
      content: `✅ The role ${role.toString()} will be given out to ${ordinal(position)} place on the leaderboard of counting channel <#${countingChannelId}>.`,
      ephemeral,
    });
  },
};

export default { ...command } as ChatInputCommand;
