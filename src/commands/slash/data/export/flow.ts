import type { SlashCommand } from "../../../../@types/command";
import { flowList } from "../../../../constants/autocompleters";

export default {
  description: "Export all data about a flow from the database",
  options: [
    {
      type: "STRING",
      name: "flow",
      description: "The flow to edit",
      autocomplete: true,
      required: true,
    },
  ],
  autocompletes: {
    flow: flowList,
  },
  // eslint-disable-next-line camelcase -- slash command options can't be camel case, we make it camel case though
  execute: (interaction, _, { flow: flowId }: { flow: string; }, document, selectedCountingChannel) => {
    const flow = document.toJSON().channels[selectedCountingChannel as string]?.flows[flowId];
    if (!flow) {
      return interaction.reply({
        content: "❌ That flow doesn't exist.",
        ephemeral: true,
      });
    } // this should never trigger considering we're using autocomplete, but we're adding a fallback message just in case

    return interaction.reply({
      content: `✅ Here's the export from <t:${Math.floor(Date.now() / 1000)}:R> - keep this safe!`,
      files: [
        {
          name: `countr_export_guild_${interaction.guildId}_channel_${selectedCountingChannel}_flow_${flowId}_data.json`,
          attachment: Buffer.from(JSON.stringify(flow, null, 2)),
        },
      ],
      ephemeral: true,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;
