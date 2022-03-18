import type { Guild } from "discord.js";
import type { SlashCommand } from "../../../@types/command";
import { generateId } from "../../../utils/crypto";
import triggers from "../../../constants/triggers";

export default {
  description: "Get notified when the server reaches a certain count",
  options: Object.entries(triggers).filter(([, { supports }]) => supports.includes("notifications")).map(([name, { short, properties }]) => ({
    ...properties?.[0].input,
    name,
    description: short,
  })),
  execute: async (interaction, ephemeralPreference, args, document, selectedCountingChannel) => {
    const countingChannel = document.channels.get(selectedCountingChannel as string);
    if (!countingChannel) return;

    const entries = Object.entries(args);
    if (entries.length > 1) {
      return interaction.reply({
        content: "❌ You can only use one of the optional arguments when creating a notification.",
        ephemeral: true,
      });
    }

    const entry = entries.find(([name]) => triggers[name]);
    if (!entry) {
      return interaction.reply({
        content: "❌ You need to specify one of the optional arguments. For example, if you want to trigger for every 100th count, you can run this: `/notifications create each:100`",
        ephemeral: true,
      });
    }

    const trigger = triggers[entry[0]];
    const rawValue = entry[1] as never;

    const { convert, help } = trigger.properties?.[0] || {};
    const value = convert ? await convert(rawValue, interaction.guild as Guild) : rawValue;
    if (value === null) {
      return interaction.reply({
        content: `❌ You need to specify a valid value for this argument. ${help}`,
        ephemeral: true,
      });
    }

    const id = generateId();
    countingChannel.notifications.set(id, {
      userId: interaction.user.id,
      trigger: {
        type: entry[0],
        data: [[value]],
      },
    });
    document.safeSave();

    const explanation = trigger.explanation([[value]]).replace(/^[A-Z]/, match => match.toLowerCase()); // get explanation and make first letter lowercase. copilot made this
    return interaction.reply({
      content: `✅ I will notify you ${explanation}.`,
      ephemeral: ephemeralPreference,
    });
  },
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
} as SlashCommand;
