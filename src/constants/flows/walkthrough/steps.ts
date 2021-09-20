import { ButtonInteraction, EmbedFieldData, InteractionButtonOptions, InteractionReplyOptions, MessageComponentInteraction, MessageSelectMenuOptions, SelectMenuInteraction } from "discord.js";
import config from "../../../../config";
import { Flow, FlowOptions } from "../../../database/models/Guild";
import { components } from "../../../handlers/interactions/components";
import { capitalizeFirst, trim } from "../../../utils/text";
import limits from "../../limits";
import actions from "../actions";
import { Property } from "../properties";
import triggers from "../triggers";

type ButtonComponentCallback = (interaction: ButtonInteraction, flow: Flow, designNewMessage: () => InteractionReplyOptions) => Promise<void>;
type SelectMenuComponentCallback = (interaction: SelectMenuInteraction, flow: Flow, designNewMessage: () => InteractionReplyOptions) => Promise<void>;

interface ButtonComponent {
  data: InteractionButtonOptions;
  callback: ButtonComponentCallback;
}

interface SelectMenuComponent {
  data: MessageSelectMenuOptions;
  callback: SelectMenuComponentCallback;
}

export type Component = ButtonComponent | SelectMenuComponent;
export type ComponentCallback = ButtonComponentCallback | SelectMenuComponentCallback;

export interface Step {
  title: string;
  description(flow: Flow): string;
  fields?(flow: Flow): Array<EmbedFieldData>;
  components?(flow: Flow): Array<Array<Component>>; // action row, components
  getStatus(flow: Flow): "complete" | "incomplete";
  skipIfExists?: boolean;
}

const steps: Array<Step> = [
  {
    title: "Welcome to the flow editor!",
    description: () => "general information about the flow generator here", // todo
    getStatus: () => "complete",
    skipIfExists: true
  },
  {
    title: "Flow details",
    description: () => "Here's some general information about the flow. You can set a custom name of the flow here, and you can also disable it temporarily if you'd like.",
    fields: flow => [
      { name: "Name (optional)", value: flow.name || "*No name is set*", inline: true },
      { name: "Status", value: flow.disabled ? "❌ Disabled" : "✅ Enabled", inline: true }
    ],
    components: flow => [[
      flow.name ? {
        data: {
          type: "BUTTON",
          label: "Remove name",
          customId: "unset_name",
          style: "SECONDARY"
        },
        callback: ((interaction, flow, designMessage) => {
          flow.name = undefined;
          interaction.update(designMessage());
        }) as ButtonComponentCallback
      } : {
        data: {
          type: "BUTTON",
          label: "Set new name",
          customId: "set_name",
          style: "PRIMARY"
        },
        callback: ((interaction, flow, designNewMessage) => {
          components.set(`${interaction.id}:set_name_to_test`, async i => {
            flow.name = "test";
            i.update(designNewMessage());
          });
          components.set(`${interaction.id}:set_name_to_testtwo`, async i => {
            flow.name = "testtwo";
            i.update(designNewMessage());
          });
          components.set(`${interaction.id}:cancel`, i => i.update(designNewMessage()));
          interaction.update({
            embeds: [],
            content: "📋 What would you like the flow name to be?",
            components: [{
              type: "ACTION_ROW",
              components: [
                {
                  type: "BUTTON",
                  label: "Set to 'test' (will be text field)",
                  customId: `${interaction.id}:set_name_to_test`,
                  style: "SECONDARY"
                },
                {
                  type: "BUTTON",
                  label: "Set to 'testtwo' (will be text field)",
                  customId: `${interaction.id}:set_name_to_testtwo`,
                  style: "SECONDARY"
                },
                {
                  type: "BUTTON",
                  label: "Cancel new name",
                  customId: `${interaction.id}:cancel`,
                  style: "DANGER"
                }
              ]
            }]
          });
        }) as ButtonComponentCallback
      },
      flow.disabled ? {
        data: {
          type: "BUTTON",
          label: "Enable the flow",
          customId: "enable",
          style: "PRIMARY"
        },
        callback: ((interaction, flow, designMessage) => {
          flow.disabled = undefined;
          interaction.update(designMessage());
        }) as ButtonComponentCallback
      } : {
        data: {
          type: "BUTTON",
          label: "Disable the flow",
          customId: "enable",
          style: "SECONDARY"
        },
        callback: ((interaction, flow, designMessage) => {
          flow.disabled = true;
          interaction.update(designMessage());
        }) as ButtonComponentCallback
      }
    ]],
    getStatus: () => "complete"
  },
  {
    title: "Triggers",
    description: () => "create triggers", // todo
    fields: flow => flow.triggers.map(({ type, data }, i) => {
      const trigger = triggers[type];
      return { name: `• ${i + 1}: ${trigger.short}`, value: trigger.explanation(data) };
    }),
    components: flow => getTriggerOrActionComponents("trigger", flow),
    getStatus: flow => flow.triggers.length ? "complete" : "incomplete",
  },
  {
    title: "Actions",
    description: () => "create actions", // todo
    fields: flow => flow.actions.map(({ type, data }, i) => {
      const action = actions[type];
      return { name: `Action ${i + 1}: ${action.short}`, value: action.explanation(data) };
    }),
    components: flow => getTriggerOrActionComponents("action", flow),
    getStatus: flow => flow.actions.length ? "complete" : "incomplete",
  }, // todo
  {
    title: "Finish up!",
    description: () => "description here",
    getStatus: () => "incomplete",
  }, // todo
];

export default steps;

function getTriggerOrActionComponents(triggerOrAction: "trigger" | "action", flow: Flow): Array<Array<Component>> {
  const aTriggerOrAnAction = triggerOrAction == "trigger" ? "a trigger" : "an action";
  const flowOptions = flow[`${triggerOrAction}s`];
  const allOptions = triggerOrAction == "trigger" ? triggers : actions;
  const limit = limits.flows[`${triggerOrAction}s`];

  return [[{
    data: {
      type: "SELECT_MENU",
      placeholder: `Create or edit ${aTriggerOrAnAction}`,
      customId: "create_or_edit",
      minValues: 1, maxValues: 1,
      options: [
        ...flowOptions.map(({ type }, i) => ({
          label: `Edit ${triggerOrAction} ${i + 1}: ${allOptions[type].short}`, value: `edit_${i}`
        })),
        {
          label: `Create a new ${triggerOrAction}`,
          description: flowOptions.length >= limit ? `You have reached the maximum amount of ${triggerOrAction}s for this flow` : `You can create up to ${limit - flowOptions.length} more ${triggerOrAction}s for this flow`,
          value: "create_new",
          disabled: flow[`${triggerOrAction}s`].length >= limit
        }
      ]
    } as MessageSelectMenuOptions,
    callback: (async (interaction, flow, designNewMessage) => {
      const command = interaction.values[0];
      if (command.startsWith("edit_")) {
        const optionIndex = parseInt(command.split("_")[1]);
        const i = await editTriggerOrAction(triggerOrAction, interaction, flowOptions[optionIndex], optionIndex, flow);
        i.update(designNewMessage());
      } else if (command == "create_new") {
        components.set(`${interaction.id}:selected`, async i => {
          i = i as SelectMenuInteraction;
          const type = i.values[0];
          const option = allOptions[type];
          const newOption = { type, data: [] } as FlowOptions;

          let currentInteraction: MessageComponentInteraction = i;
          if (option.properties) for (const property of option.properties) {
            const response = await propertyHandler(currentInteraction, property, newOption, null).then(ii => [ii, true]).catch(ii => [ii, false]);
            const ii = response[0] as MessageComponentInteraction;
            if (response[1]) currentInteraction = response[0];
            else return ii.update(designNewMessage());
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
                  minValues: 1, maxValues: 1,
                  options: Object.entries(allOptions).filter(([ type, { limit } ]) => limit ? flowOptions.filter(flowOption => flowOption.type == type).length < limit : true).map(([ type, { short, long } ]) => ({
                    label: short,
                    value: type,
                    description: long ? trim(long, 100) : undefined
                  }))
                }
              ]
            },
            {
              type: "ACTION_ROW",
              components: [
                {
                  type: "BUTTON",
                  label: `Cancel ${triggerOrAction} creation`,
                  customId: `${interaction.id}:cancel`,
                  style: "DANGER"
                }
              ]
            }
          ]
        });
      }
    }) as SelectMenuComponentCallback
  }]];
}

function editTriggerOrAction(triggerOrAction: "trigger" | "action", interaction: MessageComponentInteraction, flowOptions: FlowOptions, index: number, flow: Flow): Promise<MessageComponentInteraction> {
  const allOptions = triggerOrAction == "trigger" ? triggers : actions;

  return new Promise(resolve => {
    const { short, long, properties } = allOptions[flowOptions.type];
    components.set(`${interaction.id}:edit_property`, async i => {
      i = i as SelectMenuInteraction;
      const properties = allOptions[flowOptions.type].properties || [];
      const propertyIndex = parseInt(i.values[0]);
      propertyHandler(i, properties[propertyIndex], flowOptions, propertyIndex)
        .then(ii => editTriggerOrAction(triggerOrAction, ii, flowOptions, index, flow).then(resolve))
        .catch((ii: MessageComponentInteraction) => editTriggerOrAction(triggerOrAction, ii, flowOptions, index, flow).then(resolve)); // if they cancel, just send them back to the details of the trigger or action
    });
    components.set(`${interaction.id}:done`, async i => resolve(i as MessageComponentInteraction));
    components.set(`${interaction.id}:delete`, async i => {
      flow[`${triggerOrAction}s`] = flow[`${triggerOrAction}s`].filter((t, i) => i !== index);
      resolve(i as MessageComponentInteraction);
    });

    // get fields, this is async so we need this long line of code
    Promise.all(properties?.map(async (property, i) => ({ name: `Edit property ${i + 1}: ${property.short}`, value: String(property.format && interaction.guild ? await property.format(flowOptions.data[i], interaction.guild) : flowOptions.data[i]) })) || []).then(fields =>
      interaction.update({
        content: null,
        embeds: [{
          title: `${capitalizeFirst(triggerOrAction)} details • ${short}`,
          description: long || (fields.length ? undefined : `*There are no more details for this type of ${triggerOrAction}.*`),
          fields,
          color: config.colors.info
        }],
        components: [
          {
            type: "ACTION_ROW",
            components: [{
              type: "SELECT_MENU",
              placeholder: "Edit a property",
              customId: `${interaction.id}:edit_property`,
              minValues: 1, maxValues: 1,
              options: properties && properties.length ? properties.map(({ short, help }, i) => ({
                label: `Property ${i + 1}: ${short}`,
                value: i.toString(),
                description: help
              })) : [{
                label: `No properties are available on this ${triggerOrAction}`,
                value: "disabled"
              }],
              disabled: properties && properties.length ? false : true
            }]
          },
          {
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                label: "Done",
                customId: `${interaction.id}:done`,
                style: "SUCCESS"
              },
              {
                type: "BUTTON",
                label: "Delete this trigger",
                customId: `${interaction.id}:delete`,
                style: "DANGER"
              }
            ]
          }
        ]
      }));
  });
}

function propertyHandler(interaction: MessageComponentInteraction, property: Property, trigger: FlowOptions, propertyIndex: number | null): Promise<MessageComponentInteraction> {
  return new Promise((resolve, reject) => {
    components.set(`${interaction.id}:input_123`, async i => {
      const value = property.convert && i.guild ? await property.convert("123", i.guild) : "123";
      if (value == null) {
        components.set(`${i.id}:try_again`, async ii => propertyHandler(ii, property, trigger, propertyIndex).then(resolve).catch(reject));
        components.set(`${i.id}:cancel`, async ii => reject(ii));
        i.update({
          embeds: [
            {
              title: property.short,
              description: property.help,
              color: config.colors.info
            }, {
              title: "Invalid value",
              color: config.colors.error
            }
          ],
          components: [{
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                label: "Try again",
                customId: `${i.id}:try_again`,
                style: "SUCCESS"
              },
              {
                type: "BUTTON",
                label: "Cancel trigger edit",
                customId: `${i.id}:cancel`,
                style: "DANGER"
              }
            ]
          }]
        });
      } else {
        components.set(`${i.id}:yes`, async ii => {
          if (propertyIndex) trigger.data[propertyIndex] = value;
          else trigger.data.push(value);
          resolve(ii);
        });
        components.set(`${i.id}:no`, async ii => propertyHandler(ii, property, trigger, propertyIndex).then(resolve).catch(reject));
        i.update({
          embeds: [
            {
              title: property.short,
              description: property.help,
              color: config.colors.info
            }, {
              title: "Does this value look right to you?",
              description: `> **${property.format && i.guild ? property.format(value, i.guild) : value}**`,
              color: config.colors.warning
            }
          ],
          components: [{
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                label: "Yes",
                customId: `${i.id}:yes`,
                style: "SUCCESS"
              },
              {
                type: "BUTTON",
                label: "No",
                customId: `${i.id}:no`,
                style: "DANGER"
              }
            ]
          }]
        });
      }
    });
    components.set(`${interaction.id}:cancel`, async i => reject(i));
    interaction.update({
      content: null,
      embeds: [{
        title: property.short,
        description: property.help,
        color: config.colors.info
      }],
      components: [{
        type: "ACTION_ROW",
        components: [
          {
            type: "BUTTON",
            label: "Input '123' (will be text field)",
            customId: `${interaction.id}:input_123`,
            style: "SECONDARY"
          },
          {
            type: "BUTTON",
            label: "Cancel trigger edit",
            customId: `${interaction.id}:cancel`,
            style: "DANGER"
          }
        ]
      }]
    });
  });
}