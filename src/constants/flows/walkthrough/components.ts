import { Component, SelectMenuComponentCallback } from "../../../types/flows/components";
import { Flow, FlowOptions } from "../../../database/models/Guild";
import { MessageComponentInteraction, MessageSelectMenuOptions, SelectMenuInteraction } from "discord.js";
import actions from "../actions";
import { components } from "../../../handlers/interactions/components";
import { editProperty } from "./editors/property";
import { editTriggerOrAction } from "./editors/triggerOrAction";
import limits from "../../limits";
import triggers from "../../triggers";
import { trim } from "../../../utils/text";

export function getTriggerOrActionComponents(triggerOrAction: "trigger" | "action", flow: Flow): Array<Array<Component>> {
  const aTriggerOrAnAction = triggerOrAction === "trigger" ? "a trigger" : "an action";
  const flowOptions = flow[`${triggerOrAction}s`];
  const allOptions = triggerOrAction === "trigger" ? triggers : actions;
  const limit = limits.flows[`${triggerOrAction}s`];

  return [
    [
      {
        data: {
          type: "SELECT_MENU",
          placeholder: `Create or edit ${aTriggerOrAnAction}`,
          customId: "create_or_edit",
          minValues: 1,
          maxValues: 1,
          options: [
            ...flowOptions.map(({ type }, i) => ({
              label: `Edit ${triggerOrAction} ${i + 1}: ${allOptions[type].short}`, value: `edit_${i}`,
            })),
            {
              label: `Create a new ${triggerOrAction}`,
              description: flowOptions.length >= limit ? `You have reached the maximum amount of ${triggerOrAction}s for this flow` : `You can create up to ${limit - flowOptions.length} more ${triggerOrAction}s for this flow`,
              value: "create_new",
              disabled: flow[`${triggerOrAction}s`].length >= limit,
            },
          ],
        } as MessageSelectMenuOptions,
        callback: (async (interaction, flow, designNewMessage) => {
          const [command] = interaction.values;
          if (command.startsWith("edit_")) {
            const optionIndex = parseInt(command.split("_")[1]);
            const i = await editTriggerOrAction(triggerOrAction, interaction, flowOptions[optionIndex], optionIndex, flow);
            i.update(designNewMessage());
          } else if (command === "create_new") {
            components.set(`${interaction.id}:selected`, async i_ => {
              const i = i_ as SelectMenuInteraction;
              const [type] = i.values;
              const option = allOptions[type];
              const newOption = { type, data: []} as FlowOptions;

              let currentInteraction: MessageComponentInteraction = i;
              if (option.properties) {
                for (const property of option.properties) {
                  const response = await editProperty(currentInteraction, property, newOption, null, []).then(ii => [ii, true]).catch(ii => [ii, false]);
                  const ii = response[0] as MessageComponentInteraction;
                  if (response[1]) [currentInteraction] = response;
                  else return ii.update(designNewMessage());
                }
              }

              flowOptions.push(newOption);
              const iii = await editTriggerOrAction(triggerOrAction, currentInteraction, newOption, flowOptions.length - 1, flow);
              iii.update(designNewMessage());
            });
            components.set(`${interaction.id}:cancel`, i => i.update(designNewMessage()));
            interaction.update({
              embeds: [],
              content: `🔻 What ${triggerOrAction} type would you like to create?`,
              components: [
                {
                  type: "ACTION_ROW",
                  components: [
                    {
                      type: "SELECT_MENU",
                      placeholder: `Select ${triggerOrAction} type`,
                      customId: `${interaction.id}:selected`,
                      minValues: 1,
                      maxValues: 1,
                      options: Object.entries(allOptions).filter(([type, { limit }]) => limit ? flowOptions.filter(flowOption => flowOption.type === type).length < limit : true).map(([type, { short, long }]) => ({
                        label: short,
                        value: type,
                        description: long ? trim(long, 100) : undefined,
                      })),
                    },
                  ],
                },
                {
                  type: "ACTION_ROW",
                  components: [
                    {
                      type: "BUTTON",
                      label: `Cancel ${triggerOrAction} creation`,
                      customId: `${interaction.id}:cancel`,
                      style: "DANGER",
                    },
                  ],
                },
              ],
            });
          }
        }) as SelectMenuComponentCallback,
      },
    ],
  ];
}
