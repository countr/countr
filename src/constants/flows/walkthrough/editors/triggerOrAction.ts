import { EmbedFieldData, MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { Flow, FlowOptions } from "../../../../database/models/Guild";
import { capitalizeFirst, trim } from "../../../../utils/text";
import actions from "../../actions";
import { components } from "../../../../handlers/interactions/components";
import config from "../../../../config";
import { editProperty } from "./property";
import triggers from "../../triggers";

export function editTriggerOrAction(triggerOrAction: "trigger" | "action", interaction: MessageComponentInteraction, flowOptions: FlowOptions, index: number, flow: Flow): Promise<MessageComponentInteraction> {
  const allOptions = triggerOrAction === "trigger" ? triggers : actions;

  return new Promise(resolve => {
    const { short, long, properties } = allOptions[flowOptions.type];
    components.set(`${interaction.id}:edit_property`, i_ => {
      const i = i_ as SelectMenuInteraction;
      const properties = allOptions[flowOptions.type].properties || [];
      const propertyIndex = parseInt(i.values[0]);
      return void editProperty(i, properties[propertyIndex], flowOptions, propertyIndex)
        .then(ii => editTriggerOrAction(triggerOrAction, ii, flowOptions, index, flow).then(resolve))
        .catch((ii: MessageComponentInteraction) => editTriggerOrAction(triggerOrAction, ii, flowOptions, index, flow).then(resolve)); // if they cancel, just send them back to the details of the trigger or action
    });
    components.set(`${interaction.id}:done`, i => void resolve(i as MessageComponentInteraction));
    components.set(`${interaction.id}:delete`, i => {
      flow[`${triggerOrAction}s`] = flow[`${triggerOrAction}s`].filter((t, i) => i !== index);
      return void resolve(i as MessageComponentInteraction);
    });

    // get fields, this is async so we need this long line of code
    Promise.all<EmbedFieldData>(properties?.map(async (property, i) => ({ name: `Edit property ${i + 1}: ${property.short}`, value: String(property.format && interaction.guild ? await property.format(flowOptions.data[i], interaction.guild) : flowOptions.data[i]) })) || []).then(fields => interaction.update({
      content: null,
      embeds: [
        {
          title: `${capitalizeFirst(triggerOrAction)} details • ${short}`,
          description: long || (fields.length ? undefined : `*There are no more details for this type of ${triggerOrAction}.*`),
          fields,
          color: config.colors.info,
        },
      ],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "SELECT_MENU",
              placeholder: "Edit a property",
              customId: `${interaction.id}:edit_property`,
              minValues: 1,
              maxValues: 1,
              options: properties && properties.length ?
                properties.map(({ short, help }, i) => ({
                  label: `Property ${i + 1}: ${short}`,
                  value: i.toString(),
                  description: trim(help, 100),
                })) :
                [
                  {
                    label: `No properties are available on this ${triggerOrAction}`,
                    value: "disabled",
                  },
                ],
              disabled: !(properties && properties.length),
            },
          ],
        },
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              label: "Done",
              customId: `${interaction.id}:done`,
              style: "SUCCESS",
            },
            {
              type: "BUTTON",
              label: "Delete this trigger",
              customId: `${interaction.id}:delete`,
              style: "DANGER",
            },
          ],
        },
      ],
    }));
  });
}
