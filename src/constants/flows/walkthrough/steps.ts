import { ButtonInteraction, EmbedFieldData, InteractionButtonOptions, InteractionReplyOptions, MessageComponentInteraction, MessageSelectMenuOptions, SelectMenuInteraction } from "discord.js";
import config from "../../../../config";
import { Flow, FlowOptions } from "../../../database/models/Guild";
import { components } from "../../../handlers/interactions/components";
import { trim } from "../../../utils/text";
import limits from "../../limits";
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
    description: () => "create triggers",
    fields: flow => flow.triggers.map(({ type, data }, i) => {
      const trigger = triggers[type];
      return { name: `• ${i}: ${trigger.short}`, value: trigger.explanation(data) };
    }),
    components: flow => [[{
      data: {
        type: "SELECT_MENU",
        placeholder: "Create or edit a trigger",
        customId: "create_or_edit",
        minValues: 1, maxValues: 1,
        options: [
          ...flow.triggers.map(({ type }, i) => ({
            label: `Edit trigger ${i + 1}: ${triggers[type].short}`, value: `edit_${i}`
          })),
          {
            label: "Create a new trigger",
            description: flow.triggers.length >= limits.flows.triggers ? "You have reached the maximum amount of triggers for this flow" : `You can create up to ${limits.flows.triggers - flow.triggers.length} more triggers for this flow`,
            value: "create_new",
            disabled: flow.triggers.length >= limits.flows.triggers }
        ]
      },
      callback: (async (interaction, flow, designNewMessage) => {
        const command = interaction.values[0];
        if (command.startsWith("edit_")) {
          const triggerIndex = parseInt(command.split("_")[1]);
          const i = await editTrigger(interaction, flow.triggers[triggerIndex], triggerIndex, flow);
          i.update(designNewMessage());
        } else if (command == "create_new") {
          components.set(`${interaction.id}:selected`, async i => {
            i = i as SelectMenuInteraction;
            const type = i.values[0];
            const trigger = triggers[type];
            const newTrigger = { type, data: [] } as FlowOptions;

            let currentInteraction: MessageComponentInteraction = i;
            if (trigger.properties) for (const property of trigger.properties) {
              const response = await propertyHandler(currentInteraction, property, newTrigger, null).then(ii => [ii, true]).catch(ii => [ii, false]);
              const ii = response[0] as MessageComponentInteraction;
              if (response[1]) currentInteraction = response[0];
              else return ii.update(designNewMessage());
            }

            flow.triggers.push(newTrigger);
            const iii = await editTrigger(currentInteraction, newTrigger, flow.triggers.length - 1, flow);
            iii.update(designNewMessage());
          });
          components.set(`${interaction.id}:cancel`, i => i.update(designNewMessage()));
          interaction.update({
            embeds: [],
            content: "🔻 What trigger type would you like to create?",
            components: [
              {
                type: "ACTION_ROW",
                components: [
                  {
                    type: "SELECT_MENU",
                    placeholder: "Select trigger type",
                    customId: `${interaction.id}:selected`,
                    minValues: 1, maxValues: 1,
                    options: Object.entries(triggers).map(([ type, trigger ]) => ({
                      label: trigger.short,
                      value: type,
                      description: trigger.long ? trim(trigger.long, 100) : undefined
                    }))
                  }
                ]
              },
              {
                type: "ACTION_ROW",
                components: [
                  {
                    type: "BUTTON",
                    label: "Cancel trigger creation",
                    customId: `${interaction.id}:cancel`,
                    style: "DANGER"
                  }
                ]
              }
            ]
          });
        }
      }) as SelectMenuComponentCallback
    }]],
    getStatus: flow => flow.triggers.length ? "complete" : "incomplete",
  },
  {
    title: "Actions",
    description: () => "description here",
    getStatus: () => "incomplete",
  }, // todo
  {
    title: "Finish up!",
    description: () => "description here",
    getStatus: () => "incomplete",
  }, // todo
];

export default steps;

function editTrigger(interaction: MessageComponentInteraction, trigger: FlowOptions, triggerIndex: number, flow: Flow): Promise<MessageComponentInteraction> {
  return new Promise(resolve => {
    const { short, long, properties } = triggers[trigger.type];
    components.set(`${interaction.id}:edit_property`, async i => {
      i = i as SelectMenuInteraction;
      const properties = triggers[trigger.type].properties || [];
      const propertyIndex = parseInt(i.values[0]);
      propertyHandler(i, properties[propertyIndex], trigger, propertyIndex)
        .then(ii => editTrigger(ii, trigger, triggerIndex, flow).then(resolve))
        .catch((ii: MessageComponentInteraction) => editTrigger(ii, trigger, triggerIndex, flow).then(resolve)); // if they cancel, just send them back to the trigger details
    });
    components.set(`${interaction.id}:back`, async i => resolve(i as MessageComponentInteraction));
    components.set(`${interaction.id}:delete`, async i => {
      flow.triggers = flow.triggers.filter((t, i) => i !== triggerIndex);
      resolve(i as MessageComponentInteraction);
    });

    // get fields, this is async so we need this long line of code
    Promise.all(properties?.map(async (property, i) => ({ name: `Edit property ${i + 1}: ${property.short}`, value: String(property.format && interaction.guild ? await property.format(trigger.data[i], interaction.guild) : trigger.data[i]) })) || []).then(fields =>
      interaction.update({
        content: null,
        embeds: [{
          title: `Trigger details • ${short}`,
          description: long,
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
                label: "No properties are available on this trigger",
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
                label: "< Go back",
                customId: `${interaction.id}:back`,
                style: "PRIMARY"
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
        components.set(`${i.id}:cancel`, async i => reject(i));
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