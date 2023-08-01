import type { APIEmbed, ActionRowComponentOptions, ButtonInteraction, CommandInteraction, InteractionReplyOptions, InteractionUpdateOptions, Snowflake, AnyThreadChannel } from "discord.js";
import { PermissionsBitField, ButtonStyle, ComponentType, escapeMarkdown } from "discord.js";
import config from "../../../config";
import type { CountingChannelSchema, FlowSchema, GuildDocument } from "../../../database/models/Guild";
import { buttonComponents, getSelectTypeFromComponentType, selectMenuComponents } from "../../../handlers/interactions/components";
import { generateId } from "../../../utils/crypto";
import { calculatePermissionsForChannel, flowChannelNonThreadPermissions, flowChannelPermissions, flowChannelThreadPermissions } from "../../discord";
import limits from "../../limits";
import type { Step } from "./steps";
import steps from "./steps";

export function flowEditor(interaction: ButtonInteraction<"cached"> | CommandInteraction<"cached">, document: GuildDocument, countingChannel: CountingChannelSchema, userId: Snowflake, flowId: string = generateId()): void {
  return void (async () => {
    // check if the bot has access to the channel, so it doesn't fuck up
    const parent = interaction.channel?.parent?.isTextBased() ? await interaction.channel.parent.fetch() : null;
    const channel = interaction.channel?.isThread() ? null : await interaction.channel?.fetch() as Exclude<typeof interaction["channel"], AnyThreadChannel | null>;
    const currentPermissions = (parent ?? channel) && calculatePermissionsForChannel(parent ?? channel!, await interaction.guild.members.fetchMe({ force: false, cache: true }));
    const requiredPermissions = [...flowChannelPermissions, ...parent ? flowChannelThreadPermissions : flowChannelNonThreadPermissions];
    if (!currentPermissions?.has(requiredPermissions)) {
      return void interaction.reply({
        content: `⚠ I am missing permissions in this channel to open the flow editor: ${requiredPermissions
          .map(bigint => Object.entries(PermissionsBitField.Flags).find(([, permission]) => permission === bigint && !currentPermissions?.has(permission))?.[0])
          .filter(Boolean)
          .join(", ")}`,
        ephemeral: true,
      });
    }

    // duplicate existing flow so we don't overwrite the original
    const existingFlow = countingChannel.flows.get(flowId);
    const flow: FlowSchema = {
      disabled: false,
      triggers: [],
      actions: [],
      actionIsRandomized: false,
      allTriggersMustPass: false,
      ...JSON.parse(JSON.stringify(existingFlow ?? {})) as Partial<FlowSchema>,
    };

    // update flow.disabled if it exceeds the amount of flows allowed
    flow.disabled ||= (Array.from(countingChannel.flows.keys()).indexOf(flowId) + 1 || countingChannel.flows.size + 1) > limits.flows.amount;

    const step = existingFlow ? steps.findIndex(({ skipIfExists }) => !skipIfExists) || 0 : 0;

    return void interaction.reply(designMessage(step, flow, flowId, document, countingChannel, userId));
  })();
}

export function designMessage(stepIndex: number, flow: FlowSchema, flowIdentifier: string, document: GuildDocument, countingChannel: CountingChannelSchema, userId: Snowflake): InteractionReplyOptions & InteractionUpdateOptions {
  const step = steps[stepIndex]!;

  const randomIdentifier = generateId();

  buttonComponents.set(`${randomIdentifier}:back`, {
    allowedUsers: [userId],
    callback(button) {
      return void button.update(designMessage(stepIndex - 1, flow, flowIdentifier, document, countingChannel, userId));
    },
  });

  buttonComponents.set(`${randomIdentifier}:next`, {
    allowedUsers: [userId],
    callback(button) {
      return void button.update(designMessage(stepIndex + 1, flow, flowIdentifier, document, countingChannel, userId));
    },
  });

  buttonComponents.set(`${randomIdentifier}:save`, {
    allowedUsers: [userId],
    callback(button) {
      return void button.update(saveFlow(flow, flowIdentifier, document, countingChannel));
    },
  });

  buttonComponents.set(`${randomIdentifier}:cancel`, {
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

      buttonComponents.set(`cancel:${randomIdentifier}:no`, {
        allowedUsers: [userId],
        callback(confirmation) {
          return void confirmation.update(designMessage(stepIndex, flow, flowIdentifier, document, countingChannel, userId));
        },
      });

      buttonComponents.set(`cancel:${randomIdentifier}:yes`, {
        allowedUsers: [userId],
        callback(confirmation) {
          return void confirmation.update({ content: "🕳 Flow editing has been cancelled.", components: [] });
        },
      });
    },
  });

  return {
    content: "",
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
            (component.type === ComponentType.Button ? buttonComponents : selectMenuComponents).set(customId, {
              ...component.type === ComponentType.Button ? {} : { selectType: getSelectTypeFromComponentType(component.type) },
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
  if (!countingChannel.flows.get(flowIdentifier) && Array.from(countingChannel.flows.keys()).length >= limits.flows.amount) {
    return {
      content: `💢 You can only have up to **${limits.flows.amount}** flows in a counting channel.`,
      embeds: [],
      components: [],
    };
  }

  countingChannel.flows.set(flowIdentifier, flow);
  document.safeSave();

  return {
    content: `✅ Flow \`${flowIdentifier}\` has been saved successfully!`,
    embeds: [],
    components: [],
  };
}
