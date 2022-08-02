import type { APIEmbed, ActionRowComponentOptions, ButtonInteraction, CommandInteraction, InteractionReplyOptions, InteractionUpdateOptions, Snowflake } from "discord.js";
import { ButtonStyle, ComponentType, escapeMarkdown } from "discord.js";
import type { CountingChannelSchema, FlowSchema, GuildDocument } from "../../../database/models/Guild";
import type { Step } from "./steps";
import { components } from "../../../handlers/interactions/components";
import config from "../../../config";
import { generateId } from "../../../utils/crypto";
import limits from "../../limits";
import steps from "./steps";

export function flowEditor(interaction: ButtonInteraction<"cached"> | CommandInteraction<"cached">, document: GuildDocument, countingChannel: CountingChannelSchema, userId: Snowflake, flowId: string = generateId()): void {
  // duplicate existing flow so we don't overwrite the original
  const existingFlow = countingChannel.flows.get(flowId);
  const flow: FlowSchema = {
    disabled: false,
    triggers: [],
    actions: [],
    ...JSON.parse(JSON.stringify(existingFlow ?? {})) as Partial<FlowSchema>,
  };

  // update flow.disabled if it exceeds the amount of flows allowed
  flow.disabled = flow.disabled || (Array.from(countingChannel.flows.keys()).indexOf(flowId) + 1 || countingChannel.flows.size + 1) > limits.flows.amount;

  const step = existingFlow ? steps.findIndex(({ skipIfExists }) => !skipIfExists) || 0 : 0;

  return void interaction.reply(designMessage(step, flow, flowId, document, countingChannel, userId));
}

export function designMessage(stepIndex: number, flow: FlowSchema, flowIdentifier: string, document: GuildDocument, countingChannel: CountingChannelSchema, userId: Snowflake): InteractionReplyOptions & InteractionUpdateOptions {
  const step = steps[stepIndex]!;

  const randomIdentifier = generateId();

  components.set(`${randomIdentifier}:back`, {
    type: "BUTTON",
    allowedUsers: [userId],
    callback(button) {
      return void button.update(designMessage(stepIndex - 1, flow, flowIdentifier, document, countingChannel, userId));
    },
  });

  components.set(`${randomIdentifier}:next`, {
    type: "BUTTON",
    allowedUsers: [userId],
    callback(button) {
      return void button.update(designMessage(stepIndex + 1, flow, flowIdentifier, document, countingChannel, userId));
    },
  });

  components.set(`${randomIdentifier}:save`, {
    type: "BUTTON",
    allowedUsers: [userId],
    callback(button) {
      return void button.update(saveFlow(flow, flowIdentifier, document, countingChannel));
    },
  });

  components.set(`${randomIdentifier}:cancel`, {
    type: "BUTTON",
    allowedUsers: [userId],
    callback(button) {
      void button.update({
        content: "💢 Are you sure you want to cancel? You will lose all your progress!",
        embeds: [],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                label: "No, go back",
                customId: `cancel:${randomIdentifier}:no`,
                style: ButtonStyle.Secondary,
              },
              {
                type: ComponentType.Button,
                label: "Yes, I'm sure",
                customId: `cancel:${randomIdentifier}:yes`,
                style: ButtonStyle.Danger,
              },
            ],
          },
        ],
      });

      components.set(`cancel:${randomIdentifier}:no`, {
        type: "BUTTON",
        allowedUsers: [userId],
        callback(confirmation) {
          return void confirmation.update(designMessage(stepIndex, flow, flowIdentifier, document, countingChannel, userId));
        },
      });

      components.set(`cancel:${randomIdentifier}:yes`, {
        type: "BUTTON",
        allowedUsers: [userId],
        callback(confirmation) {
          return void confirmation.update({ content: "🕳 Flow editing has been cancelled.", components: []});
        },
      });
    },
  });

  return {
    content: null,
    embeds: [
      {
        title: flow.name ? `Editing flow "${escapeMarkdown(flow.name)}" (\`${flowIdentifier}\`)` : `Editing flow \`${flowIdentifier}\``,
        color: parseInt(flowIdentifier, 16),
        description: steps.map(({ title }, index) => {
          if (stepIndex === index) return `🌀 **Step ${index + 1}: ${title}**`;
          if (stepIndex > index) return `✅ ~~Step ${index + 1}: ${title}~~`;
          return `✴️ Step ${index + 1}: ${title}`;
        }).join("\n"),
      },
      designEmbed(step, flow),
    ],
    components: [
      ...step.components ?
        step.components(flow, userId).map(group => ({
          type: ComponentType.ActionRow,
          components: group.map<ActionRowComponentOptions>(({ callback, ...component }) => {
            const customId = `${randomIdentifier}:${component.custom_id}`;
            components.set(customId, {
              type: component.type === ComponentType.Button ? "BUTTON" : "SELECT_MENU",
              allowedUsers: [userId],
              callback(interaction: never) {
                return void callback(interaction, () => designMessage(stepIndex, flow, flowIdentifier, document, countingChannel, userId), flow, countingChannel);
              },
            });

            return { ...component, customId };
          }),
        })) :
        [],
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: "< Back",
            customId: `${randomIdentifier}:back`,
            style: ButtonStyle.Primary,
            disabled: stepIndex === 0,
          },
          {
            type: ComponentType.Button,
            label: `Step ${stepIndex + 1}/${steps.length}`,
            customId: `${randomIdentifier}:disabled`,
            style: ButtonStyle.Secondary,
            disabled: true,
          },
          {
            type: ComponentType.Button,
            label: "Next >",
            customId: `${randomIdentifier}:next`,
            style: ButtonStyle.Primary,
            disabled: stepIndex === steps.length - 1 || step.getStatus(flow) === "incomplete",
          },
          {
            type: ComponentType.Button,
            label: "Save",
            customId: `${randomIdentifier}:save`,
            style: ButtonStyle.Success,
            disabled: steps.some(({ getStatus }) => getStatus(flow) === "incomplete"),
          },
          {
            type: ComponentType.Button,
            label: "Cancel",
            customId: `${randomIdentifier}:cancel`,
            style: ButtonStyle.Danger,
          },
        ],
      },
    ],
  };
}

function designEmbed({ title, description, fields }: Step, flow: FlowSchema): APIEmbed {
  return {
    title,
    description,
    ...fields && { fields: fields(flow) },
    color: config.colors.info,
  };
}

function saveFlow(flow: FlowSchema, flowIdentifier: string, document: GuildDocument, countingChannel: CountingChannelSchema): InteractionUpdateOptions {
  countingChannel.flows.set(flowIdentifier, flow);
  document.safeSave();

  return {
    content: `✅ Flow \`${flowIdentifier}\` has been saved successfully!`,
    embeds: [],
    components: [],
  };
}
