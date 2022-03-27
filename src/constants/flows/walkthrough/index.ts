import type { CommandInteraction, InteractionReplyOptions, MessageButtonOptions, MessageEmbedOptions, User } from "discord.js";
import type { CountingChannel, Flow, GuildDocument } from "../../../database/models/Guild";
import steps, { Step } from "./steps";
import { components } from "../../../handlers/interactions/components";
import config from "../../../config";
import { generateId } from "../../../utils/crypto";
import limits from "../../limits";

const inProgress: Map<string, {
  guildId: string;
  userId: string;
  flow: Flow;
  abortCurrentEditor: (user: User) => Promise<unknown>;
}> = new Map();

export default (interaction: CommandInteraction, document: GuildDocument, channel: string, existingFlow?: Flow, existingFlowIdentifier?: string): void => {
  const exists = Boolean(existingFlow);
  const disabled = Array.from(document.channels.get(channel)?.flows.values() || []).filter(flow => flow.disabled).length >= limits.flows.amount;

  const flow = JSON.parse(JSON.stringify(existingFlow || { ...disabled ? { disabled } : {}, triggers: [], actions: []})) as Flow; // clone so we don't modify the live flow, if it exists
  const flowIdentifier = existingFlowIdentifier || generateId();

  const step = exists ? steps.indexOf(steps.find(step => !step.skipIfExists) || steps[0]) : 0;

  const flowInProgress = inProgress.get(flowIdentifier);
  if (flowInProgress) {
    components.set(`${interaction.id}:no`, i => i.update({ content: "", components: []}));
    components.set(`${interaction.id}:yes`, i => {
      flowInProgress.abortCurrentEditor(i.user);
      inProgress.set(flowIdentifier, Object.assign({}, flowInProgress, {
        userId: interaction.user.id,
        abortCurrentEditor: (user: User) => i.editReply({ content: `💢 This flow has been re-opened by ${user}.`, embeds: [], components: []}),
      }));
      return i.update(designMessage(step, flow, flowIdentifier, document, channel));
    });

    interaction.reply({
      content: "🚫 This flow is already in the flow editor, would you like to re-open the editor?",
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              label: "No",
              customId: `${interaction.id}:no`,
              style: "DANGER",
            },
            {
              type: "BUTTON",
              label: "Yes",
              customId: `${interaction.id}:yes`,
              style: "SUCCESS",
            },
          ],
        },
      ],
    });
  } else {
    inProgress.set(flowIdentifier, {
      guildId: interaction.guildId as string,
      userId: interaction.user.id,
      flow,
      abortCurrentEditor: (user: User) => interaction.editReply({ content: `💢 This flow has been re-opened by ${user}.`, embeds: [], components: []}),
    });
    interaction.reply(designMessage(step, flow, flowIdentifier, document, channel));
  }
};

export function designMessage(selected: number, flow: Flow, flowIdentifier: string, document: GuildDocument, channel: string): InteractionReplyOptions {
  const selectedStep = steps[selected];

  const randomIdentifier = Math.random().toString(36).substring(2);

  components.set(`previous:${randomIdentifier}`, i => i.update(designMessage(selected - 1, flow, flowIdentifier, document, channel)));
  components.set(`next:${randomIdentifier}`, i => i.update(designMessage(selected + 1, flow, flowIdentifier, document, channel)));
  components.set(`save:${randomIdentifier}`, i => i.update(saveFlow(flow, flowIdentifier, document, channel)));
  components.set(`cancel:${randomIdentifier}`, i => {
    components.set(`cancel:${randomIdentifier}:yes`, i => {
      inProgress.delete(flowIdentifier);
      return void i.update({ content: "🕳 Flow editing has been cancelled.", components: []});
    });
    components.set(`cancel:${randomIdentifier}:no`, i => i.update(designMessage(selected, flow, flowIdentifier, document, channel)));
    return void i.update({
      content: "💢 Are you sure you want to cancel? You will lose all your progress!",
      embeds: [],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              label: "No, go back",
              customId: `cancel:${randomIdentifier}:no`,
              style: "SECONDARY",
            },
            {
              type: "BUTTON",
              label: "Yes, I'm sure",
              customId: `cancel:${randomIdentifier}:yes`,
              style: "DANGER",
            },
          ],
        },
      ],
    });
  });

  const message = {
    content: null,
    embeds: [
      {
        title: flow.name ? `Editing flow "${flow.name}" (\`${flowIdentifier}\`)` : `Editing flow \`${flowIdentifier}\``,
        color: parseInt(flowIdentifier, 16),
        description: steps.map((step, index) => selected === index ?
          `🌀 **Step ${index + 1}: ${step.title}**` :
          selected > index ?
            `✅ ~~Step ${index + 1}: ${step.title}~~` :
            `✴️ Step ${index + 1}: ${step.title}`).join("\n"),
      },
      // ...steps.map((step, index) => designStepEmbed(step, index, flow, selected)),
      designEmbed(selectedStep, flow),
    ],
    components: [
      ...selectedStep.components ?
        selectedStep.components(flow).map(group => ({
          type: "ACTION_ROW",
          components: group.map(component => {
            const customId = `${randomIdentifier}:${component.data.customId}`;
            components.set(customId, i => component.callback(i as never, flow, () => designMessage(selected, flow, flowIdentifier, document, channel), document.channels.get(channel) as CountingChannel));
            return { ...component.data, customId };
          }),
        })) :
        [],
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "BUTTON",
            label: "< Back",
            customId: `previous:${randomIdentifier}`,
            style: "PRIMARY",
            disabled: selected === 0,
          },
          {
            type: "BUTTON",
            label: `Step ${selected + 1}/${steps.length}`,
            customId: `disabled:${randomIdentifier}`,
            style: "SECONDARY",
            disabled: true,
          },
          selected !== steps.length - 1 ?
            {
              type: "BUTTON",
              label: "Next >",
              customId: `next:${randomIdentifier}`,
              style: "PRIMARY",
              disabled: selectedStep.getStatus(flow) === "incomplete",
            } :
            null,
          !steps.find(step => step.getStatus(flow) === "incomplete") ?
            {
              type: "BUTTON",
              label: "Save flow",
              customId: `save:${randomIdentifier}`,
              style: "SUCCESS",
            } :
            null,
          {
            type: "BUTTON",
            label: "Cancel",
            customId: `cancel:${randomIdentifier}`,
            style: "DANGER",
          },
        ].filter(Boolean) as Array<MessageButtonOptions>,
      },
    ],
  };

  return message as InteractionReplyOptions;
}

function designEmbed(step: Step, flow: Flow): MessageEmbedOptions {
  const embed = {
    title: step.title,
    description: step.description(flow),
    fields: step.fields ? step.fields(flow) : undefined,
    color: config.colors.info,
  } as MessageEmbedOptions;
  return embed;
}

function saveFlow(flow: Flow, flowIdentifier: string, document: GuildDocument, channel: string): InteractionReplyOptions {
  document.channels.get(channel)?.flows.set(flowIdentifier, flow);
  const success = Boolean(document.channels.get(channel)?.flows.has(flowIdentifier)); // double-check it worked
  if (success) {
    document.safeSave();
    return {
      content: `✅ Flow \`${flowIdentifier}\` has been saved successfully!`,
      embeds: [],
      components: [],
    };
  } return {
    content: `💢 Failed to save flow \`${flowIdentifier}\`. Does the counting channel exist anymore?`,
    embeds: [],
    components: [],
  };
}
