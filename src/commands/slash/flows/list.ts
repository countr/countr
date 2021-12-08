import { InteractionReplyOptions, SelectMenuInteraction } from "discord.js";
import { Flow } from "../../../database/models/Guild";
import { SlashCommand } from "../../../types/command";
import { components } from "../../../handlers/interactions/components";

export default {
  description: "List all the flows configured",
  execute: (interaction, _, __, document, selectedCountingChannel) => {
    const flows = document.channels.get(selectedCountingChannel || "")?.flows;
    if (!flows) return; // always defined

    interaction.reply(createMessage(interaction.id, Array.from(flows.entries())));
  },
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
} as SlashCommand;

const embedsPerMessage = 10;

function createMessage(randomIdentifier: string, flows: Array<[ string, Flow ]>, page = 0): InteractionReplyOptions {
  const totalPages = Math.ceil(flows.length / embedsPerMessage);
  const flowsForThisPage = flows.slice(page * embedsPerMessage, (page + 1) * embedsPerMessage);

  const embeds = flowsForThisPage.map(([flowId, f]) => ({
    title: `${f.name ? `${f.name} (\`${flowId}\`)` : `\`${flowId}\``} ${f.disabled ? "(disabled)" : ""}`,
    color: parseInt(flowId, 16),
    description: `**${f.triggers.length === 1 ? "1 trigger" : `${f.triggers.length} triggers`}** and **${f.actions.length === 1 ? "1 action" : `${f.actions.length} actions`}** is configured.`,
  }));

  const message: InteractionReplyOptions = {
    embeds,
    components: [
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "SELECT_MENU",
            placeholder: "Go to details",
            minValues: 1,
            maxValues: 1,
            customId: `${randomIdentifier}:details`,
            options: flowsForThisPage.map(([flowId, f]) => ({
              label: f.name ? `${f.name} (${flowId})` : flowId,
              value: flowId,
            })),
          },
        ],
      },
    ],
  };

  components.set(`${randomIdentifier}:details`, i_ => {
    const i = i_ as SelectMenuInteraction;
    const [flowId] = i.values;
    // todo add details
  });

  if (totalPages > 1) {
    components.set(`${randomIdentifier}:previous`, i => i.update(createMessage(i.id, flows, page - 1)));
    components.set(`${randomIdentifier}:next`, i => i.update(createMessage(i.id, flows, page + 1)));

    message.components?.push({
      type: "ACTION_ROW",
      components: [
        {
          type: "BUTTON",
          label: "< Back",
          customId: `${randomIdentifier}:previous`,
          style: "PRIMARY",
          disabled: page === 0,
        },
        {
          type: "BUTTON",
          label: `Page ${page + 1}/${totalPages}`,
          customId: `${randomIdentifier}:disabled`,
          style: "SECONDARY",
          disabled: true,
        },
        {
          type: "BUTTON",
          label: "Next >",
          customId: `${randomIdentifier}:next`,
          style: "PRIMARY",
          disabled: page === totalPages - 1,
        },
      ],
    });
  }

  return message;
}
