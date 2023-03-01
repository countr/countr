import type { APIButtonComponentWithCustomId, APISelectMenuComponent, Awaitable, ButtonInteraction, InteractionReplyOptions, InteractionUpdateOptions, SelectMenuInteraction, Snowflake } from "discord.js";
import { ButtonStyle, ComponentType } from "discord.js";
import type { ActionDetailsSchema, CountingChannelSchema, FlowSchema, TriggerDetailsSchema } from "../../../database/models/Guild";
import { components } from "../../../handlers/interactions/components";
import { fitText } from "../../../utils/text";
import type { Action } from "../../flows/actions";
import actions from "../../flows/actions";
import limits from "../../limits";
import type { Trigger } from "../../triggers";
import triggers from "../../triggers";
import promptProperty from "../properties";
import editTriggerOrAction from "../triggerOrActions";

export type FlowEditorComponent = FlowEditorButtonComponent | FlowEditorSelectMenuComponent;

export interface FlowEditorButtonComponent extends APIButtonComponentWithCustomId {
  callback(interaction: ButtonInteraction<"cached">, designNewMessage: () => InteractionReplyOptions & InteractionUpdateOptions, flow: FlowSchema, countingChannel: CountingChannelSchema): Awaitable<void>;
}

export interface FlowEditorSelectMenuComponent extends APISelectMenuComponent {
  callback(interaction: SelectMenuInteraction<"cached">, designNewMessage: () => InteractionReplyOptions & InteractionUpdateOptions, flow: FlowSchema, countingChannel: CountingChannelSchema): Awaitable<void>;
}

export function getTriggerOrActionComponents(triggerOrAction: "action" | "trigger", flow: FlowSchema, userId: Snowflake): Array<[FlowEditorComponent, ...FlowEditorComponent[]]> {
  const aTriggerOrAnAction = triggerOrAction === "trigger" ? "a trigger" : "an action";
  const flowOptions = flow[`${triggerOrAction}s`];
  const allOptions = triggerOrAction === "trigger" ? triggers : actions;
  const limit = limits.flows[`${triggerOrAction}s`];

  return [
    [
      {
        type: ComponentType.SelectMenu,
        placeholder: `Create or edit ${aTriggerOrAnAction}`,
        /* eslint-disable camelcase */
        custom_id: "create_or_edit",
        min_values: 1,
        max_values: 1,
        /* eslint-enable camelcase */
        options: [
          ...flowOptions.map(({ type }, i) => ({
            label: `Edit ${triggerOrAction} ${i + 1}: ${(allOptions[type as keyof typeof allOptions] as Action & Trigger).name}`,
            value: `edit_${i}`,
          })),
          {
            label: `Create a new ${triggerOrAction}`,
            description: flowOptions.length >= limit ? `You have reached the maximum amount of ${triggerOrAction}s for this flow` : `You can create up to ${limit - flowOptions.length} more ${triggerOrAction}s for this flow`,
            value: "create_new",
          },
        ],
        async callback(select, designNewMessage) {
          const [command] = select.values as ["create_new" | `edit_${number}`];
          if (command.startsWith("edit_")) {
            const i = parseInt(command.split("_")[1]!, 10);
            const flowOption = flowOptions[i]!;
            const interaction = await editTriggerOrAction(triggerOrAction, select, userId, flowOption, i, flow);
            return void interaction.update(designNewMessage());
          }

          // create_new
          void select.update({
            embeds: [],
            content: `🔻 What ${triggerOrAction} type would you like to create?`,
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.SelectMenu,
                    placeholder: `Select a ${triggerOrAction} type`,
                    customId: `${select.id}:selected`,
                    minValues: 1,
                    maxValues: 1,
                    options: (Object.entries(allOptions) as Array<[string, Action & Trigger]>)
                      .filter(([type, { limitPerFlow, supports = null }]) => {
                        if (supports && !supports.includes("flows")) return false;
                        if ((limitPerFlow ?? Infinity) <= (flowOptions as Array<{ type: string }>).filter(option => option.type === type).length) return false;
                        return true;
                      })
                      .map(([type, { name, description }]) => ({
                        label: name,
                        value: type,
                        ...description && { description: fitText(description, 100) },
                      })),
                  },
                ],
              },
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    label: `Cancel ${triggerOrAction} creation`,
                    customId: `${select.id}:cancel`,
                    style: ButtonStyle.Danger,
                  },
                ],
              },
            ],
          });

          components.set(`${select.id}:selected`, {
            type: "SELECT_MENU",
            allowedUsers: [select.user.id],
            async callback(selected) {
              const [type] = selected.values as [keyof typeof allOptions];
              const option = allOptions[type] as Action | Trigger;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const newOption = { type, data: [] } as ActionDetailsSchema<any> | TriggerDetailsSchema<any>;

              let interaction: ButtonInteraction<"cached"> | SelectMenuInteraction<"cached"> = selected;
              if (option.properties) {
                for (const property of option.properties) {
                  const [value, newInteraction] = await promptProperty(interaction, userId, property) as Awaited<ReturnType<typeof promptProperty>>;
                  if (value === null) return void newInteraction.update(designNewMessage());

                  newOption.data.push(value as never);
                  interaction = newInteraction;
                }
              }

              flowOptions.push(newOption as never);
              return void editTriggerOrAction(triggerOrAction, interaction, userId, newOption, flowOptions.length - 1, flow).then(newInteraction => newInteraction.update(designNewMessage()));
            },
          });

          components.set(`${select.id}:cancel`, {
            type: "BUTTON",
            allowedUsers: [select.user.id],
            callback(button) {
              return void button.update(designNewMessage());
            },
          });

          return void 0;
        },
      },
    ],
  ];
}
