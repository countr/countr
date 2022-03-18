import type { InteractionReplyOptions, SelectMenuInteraction } from "discord.js";
import type { Flow } from "../../../database/models/Guild";
import type { SlashCommand } from "../../../@types/command";
import actions from "../../../constants/flows/actions";
import { components } from "../../../handlers/interactions/components";
import { embedsPerMessage } from "../../../constants/discord";
import triggers from "../../../constants/triggers";

export default {
  description: "List all the flows configured",
  execute: (interaction, _, __, document, selectedCountingChannel) => {
    const flows = document.channels.get(selectedCountingChannel as string)?.flows;
    if (!flows) return; // always defined

    if (!flows.size) {
      return interaction.reply({
        content: `❌ <#${selectedCountingChannel}> has no flows configured.`,
        ephemeral: true,
      });
    }

    interaction.reply(createMessage(interaction.id, Array.from(flows.entries()), selectedCountingChannel as string));
  },
  disableInCountingChannel: true,
  requireSelectedCountingChannel: true,
} as SlashCommand;

function createMessage(randomIdentifier: string, flows: Array<[ string, Flow ]>, channel: string, page = 0): InteractionReplyOptions {
  const totalPages = Math.ceil(flows.length / embedsPerMessage);
  const flowsForThisPage = flows.slice(page * embedsPerMessage, (page + 1) * embedsPerMessage);

  const embeds = flowsForThisPage.map(([flowId, f]) => ({
    title: `${f.name ? `${f.name} (\`${flowId}\`)` : `\`${flowId}\``} ${f.disabled ? "(disabled)" : ""}`,
    color: parseInt(flowId, 16),
    description: `**${f.triggers.length === 1 ? "1 trigger" : `${f.triggers.length} triggers`}** and **${f.actions.length === 1 ? "1 action" : `${f.actions.length} actions`}** is configured.`,
  }));

  const message: InteractionReplyOptions = {
    content: `Showing flows **${page * embedsPerMessage + 1}-${page * embedsPerMessage + flowsForThisPage.length}** (${flows.length} flows total) for channel <#${channel}>.`,
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

    const flow = flows.find(([id]) => id === flowId)?.[1];
    if (!flow) return;

    components.set(`${i.id}:back`, i__ => i__.update(createMessage(i__.id, flows, channel, page)));

    i.update({
      content: null,
      embeds: [
        {
          title: `${flow.name ? `${flow.name} (\`${flowId}\`)` : `\`${flowId}\``} ${flow.disabled ? "(disabled)" : ""}`,
          color: parseInt(flowId, 16),
          fields: [
            {
              name: "Status",
              value: flow.disabled ? "❌ Disabled" : "✅ Enabled",
              inline: true,
            },
          ],
        },
        {
          title: "Triggers",
          color: parseInt(flowId, 16),
          fields: flow.triggers.map(({ type, data }, i) => {
            const trigger = triggers[type];
            return { name: `• ${i + 1}: ${trigger.short}`, value: trigger.explanation(data) };
          }),
        },
        {
          title: "Actions",
          color: parseInt(flowId, 16),
          fields: flow.actions.map(({ type, data }, i) => {
            const action = actions[type];
            return { name: `• ${i + 1}: ${action.short}`, value: action.explanation(data) };
          }),
        },
      ],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              label: "Go back to list",
              customId: `${i.id}:back`,
              style: "SECONDARY",
            },
          ],
        },
      ],
    });
  });

  if (totalPages > 1) {
    components.set(`${randomIdentifier}:previous`, i => i.update(createMessage(i.id, flows, channel, page - 1)));
    components.set(`${randomIdentifier}:next`, i => i.update(createMessage(i.id, flows, channel, page + 1)));

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
