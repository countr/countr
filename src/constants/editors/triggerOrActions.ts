import type { APIEmbedField, ButtonInteraction, MessageComponentInteraction, SelectMenuInteraction, Snowflake } from "discord.js";
import { ButtonStyle, ComponentType } from "discord.js";
import config from "../../config";
import type { ActionDetailsSchema, FlowSchema, TriggerDetailsSchema } from "../../database/models/Guild";
import { components } from "../../handlers/interactions/components";
import { capitalizeFirst, fitText } from "../../utils/text";
import type { Action } from "../flows/actions";
import actions from "../flows/actions";
import type { Trigger } from "../triggers";
import triggers from "../triggers";
import promptProperty from "./properties";

export default function editTriggerOrAction<T extends "action" | "trigger">(triggerOrAction: T, interaction: ButtonInteraction<"cached"> | SelectMenuInteraction<"cached">, userId: Snowflake, flowOptions: T extends "trigger" ? TriggerDetailsSchema<any> : ActionDetailsSchema<any>, flowOptionIndex: number, flow: FlowSchema): Promise<MessageComponentInteraction> {
  const allOptions = triggerOrAction === "trigger" ? triggers : actions;
  const { name, description, properties, explanation } = allOptions[flowOptions.type as keyof typeof allOptions] as Action & Trigger;

  return new Promise(resolve => {
    void Promise.all<APIEmbedField>(properties?.map(async (property, i) => ({
      name: `• Property ${i + 1}: ${property.name}`,
      value: await property.format(flowOptions.data[i], interaction.guild),
    })) ?? []).then(fields => interaction.update({
      content: null,
      embeds: [
        {
          title: `${capitalizeFirst(triggerOrAction)} details • ${name}`,
          ...(description || !fields.length) && { description: (description ?? `*There are no more details for this type of ${triggerOrAction}.*`) + (fields.length ? `\n**${capitalizeFirst(triggerOrAction)} explanation:** ${explanation(flowOptions.data)}` : "") },
          fields,
          color: config.colors.info,
        },
      ],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.SelectMenu,
              placeholder: "Edit a property",
              customId: `${interaction.id}:edit_property`,
              minValues: 1,
              maxValues: 1,
              options: properties?.length ?
                properties.map((property, i) => ({
                  label: `Property ${i + 1}: ${property.name}`,
                  value: i.toString(),
                  ...property.description && { description: fitText(property.description, 100) },
                })) :
                [
                  {
                    label: `No properties are available on this ${triggerOrAction}`,
                    value: "disabled",
                  },
                ],
              disabled: !properties?.length,
            },
          ],
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              label: "Done",
              customId: `${interaction.id}:done`,
              style: ButtonStyle.Success,
            },
            {
              type: ComponentType.Button,
              label: "Delete this trigger",
              customId: `${interaction.id}:delete`,
              style: ButtonStyle.Danger,
            },
          ],
        },
      ],
    }));

    components.set(`${interaction.id}:edit_property`, {
      type: "SELECT_MENU",
      allowedUsers: [interaction.user.id],
      async callback(select) {
        const i = parseInt(select.values[0]!, 10);
        const property = properties![i]!;
        const [value, newInteraction] = await promptProperty(select, userId, property, flowOptions.data[i]);

        if (value !== null) flowOptions.data[i] = value;
        return void editTriggerOrAction(triggerOrAction, newInteraction, userId, flowOptions, flowOptionIndex, flow).then(resolve);
      },
    });

    components.set(`${interaction.id}:done`, {
      type: "BUTTON",
      allowedUsers: [interaction.user.id],
      callback(button) {
        return resolve(button);
      },
    });

    components.set(`${interaction.id}:delete`, {
      type: "BUTTON",
      allowedUsers: [interaction.user.id],
      callback(button) {
        flow[`${triggerOrAction}s`] = (flow[`${triggerOrAction}s`] as never[]).filter((_, i) => i !== flowOptionIndex);
        return resolve(button);
      },
    });
  });
}
