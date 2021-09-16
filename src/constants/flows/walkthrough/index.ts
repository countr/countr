import { CommandInteraction, InteractionReplyOptions, MessageButtonOptions, MessageEmbedOptions } from "discord.js";
import config from "../../../../config";
import { Flow } from "../../../database/models/Guild";
import steps, { ComponentCallback, Step } from "./steps";

export default async (interaction: CommandInteraction, flow?: Flow): Promise<void> => {
  const exists = Boolean(flow);
  flow = flow || new Flow();

  const step = steps.find(step => exists ? !step.skipIfExists : true) || steps[0], selected = steps.indexOf(step);

  interaction.followUp(designMessage(selected, flow));
};

export function designMessage(selected: number, flow: Flow): InteractionReplyOptions {
  const step = steps[selected];

  const randomIdentifier = Math.random().toString(36).substring(2);

  // todo set component callbacks in "../../../handlers/interactions/components"

  const message = {
    content: "",
    embeds: steps.map((step, index) => designEmbed(step, index, flow, selected)),
    components: [
      ...(step.components ? step.components(flow).map(group => ({ type: "ACTION_ROW", components: group.map(component => ({ ...component.data, customId: `${randomIdentifier}:${component.data.customId}` })) })) : []),
      { type: "ACTION_ROW", components: [
        {
          type: "BUTTON",
          label: "< Back",
          customId: `previous:${randomIdentifier}`,
          style: "PRIMARY",
          disabled: selected == 0
        },
        {
          type: "BUTTON",
          label: `${selected + 1}/${steps.length}`,
          customId: `disabled:${randomIdentifier}`,
          style: "SECONDARY",
          disabled: true
        },
        {
          type: "BUTTON",
          label: "Next >",
          customId: `next:${randomIdentifier}`,
          style: "PRIMARY",
          disabled: selected == steps.length - 1
        }
      ] as Array<MessageButtonOptions> }
    ],
    ephemeral: true
  };

  if (step.components) {
    const allCallbacks: Array<ComponentCallback> = [];
    step.components(flow).forEach(group => group.forEach(component => allCallbacks.push(component.callback)));

    // todo set component callbacks in "../../../handlers/interactions/components"
  }

  return message as InteractionReplyOptions;
}

function designEmbed(step: Step, index: number, flow: Flow, selected: number): MessageEmbedOptions {
  const status = selected < index ? "complete" : selected == index ? "selected" : "incomplete";

  const embed = selected ? {
    title: "tt"
  } : {
    footer: {
      text: `Step ${index + 1}: ${step.title}`,
      iconUrl: config.progressIcons[status]
    }
  };

  return embed as MessageEmbedOptions;
}