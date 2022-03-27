import { ButtonComponentCallback, Component, getTriggerOrActionComponents } from "./components";
import { flowHelpUrl, supportServerUrl } from "../../links";
import type { EmbedFieldData } from "discord.js";
import type { Flow } from "../../../database/models/Guild";
import actions from "../actions";
import { awaitingInput } from "../../../commands/slash/flows/input";
import { components } from "../../../handlers/interactions/components";
import limits from "../../limits";
import triggers from "../../triggers";

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
    description: () => [
      "I will guide you through creating a flow. It is very easy to set one up, and you can customize flows a lot as well!",
      "",
      "Here's some things to note:",
      "• **Any trigger** will run **all actions**. So if you want to give out role rewards, you need to set up a flow per reward.",
      "• Actions run **asynchronously**, meaning that your first action will run, and then your second, and then your third etc.",
      "• If an action fails, it will just continue on to the next action.",
      "",
      `Click the buttons below to navigate. Need help? Check out the [documentation](${flowHelpUrl}) or ask a question in the [support server](${supportServerUrl}). Have feedback? Join the support server, we would love to hear from you!`,
    ].join("\n"),
    getStatus: () => "complete",
    skipIfExists: true,
  },
  {
    title: "Triggers",
    description: () => [
      "Triggers are the conditions that will trigger your flow. You can set up multiple triggers. Keep in mind that if any trigger's condition is met, all actions will run.",
      "",
      "You can add and edit triggers below!",
    ].join("\n"),
    fields: flow => flow.triggers.map(({ type, data }, i) => {
      const trigger = triggers[type];
      return { name: `• ${i + 1}: ${trigger.short}`, value: trigger.explanation(data) };
    }),
    components: flow => getTriggerOrActionComponents("trigger", flow),
    getStatus: flow => flow.triggers.length ? "complete" : "incomplete",
  },
  {
    title: "Actions",
    description: () => [
      "Actions are what will happen when a trigger is met. You can set up multiple actions. If any of the actions fails, it will continue the flow.",
      "",
      "You can add and edit actions below!",
    ].join("\n"),
    fields: flow => flow.actions.map(({ type, data }, i) => {
      const action = actions[type];
      return { name: `• ${i + 1}: ${action.short}`, value: action.explanation(data) };
    }),
    components: flow => getTriggerOrActionComponents("action", flow),
    getStatus: flow => flow.actions.length ? "complete" : "incomplete",
  },
  {
    title: "Flow details (Optional)",
    description: () => "Here's some optional settings you can set, like a custom name. You can also disable it if you'd like.",
    fields: flow => [
      {
        name: "Name (optional)",
        value: flow.name || "*No name is set*",
        inline: true,
      },
      {
        name: "Status",
        value: flow.disabled ? "❌ Disabled" : "✅ Enabled",
        inline: true,
      },
    ],
    components: flow => [
      [
        flow.name ?
          {
            data: {
              type: "BUTTON",
              label: "Remove name",
              customId: "unset_name",
              style: "SECONDARY",
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            callback: ((interaction, flow, designMessage, _) => {
              delete flow.name;
              interaction.update(designMessage());
            }) as ButtonComponentCallback,
          } :
          {
            data: {
              type: "BUTTON",
              label: "Set new name",
              customId: "set_name",
              style: "PRIMARY",
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars -- //! fix this, typescript fails
            callback: ((interaction, flow, designNewMessage, _) => {
              awaitingInput.set([interaction.channelId, interaction.user.id].join("."), (i, args) => {
                let name = args["text"] as string | undefined;
                if (!name) {
                  return i.reply({
                    content: "❌ You need to use the `text` argument to set the name.\n> `/flows input text:INPUT_HERE`",
                    ephemeral: true,
                  });
                }

                name = name.trim();

                if (name.length < 1) {
                  return i.reply({
                    content: "❌ Invalid name input.\n> \"/flows input text:INPUT_HERE\"",
                    ephemeral: true,
                  });
                }

                awaitingInput.delete([interaction.channelId, interaction.user.id].join("."));

                flow.name = name;
                interaction.deleteReply();
                return void i.reply(designNewMessage());
              });
              components.set(`${interaction.id}:cancel`, i => i.update(designNewMessage()));
              interaction.update({
                embeds: [],
                content: "📋 What would you like the flow name to be?\n> `/flows input text:`",
                components: [
                  {
                    type: "ACTION_ROW",
                    components: [
                      {
                        type: "BUTTON",
                        label: "Cancel new name",
                        customId: `${interaction.id}:cancel`,
                        style: "DANGER",
                      },
                    ],
                  },
                ],
              });
            }) as ButtonComponentCallback,
          },
        flow.disabled ?
          {
            data: {
              type: "BUTTON",
              label: "Enable the flow",
              customId: "enable",
              style: "PRIMARY",
            },
            callback: ((interaction, flow, designMessage, channel) => {
              if (Array.from(channel.flows.values()).filter(f => f.disabled).length >= limits.flows.amount) {
                return interaction.reply({
                  content: `❌ You can only have **${limits.flows.amount}** flows enabled at a time.`,
                  ephemeral: true,
                });
              }
              delete flow.disabled;
              interaction.update(designMessage());
            }) as ButtonComponentCallback,
          } :
          {
            data: {
              type: "BUTTON",
              label: "Disable the flow",
              customId: "enable",
              style: "SECONDARY",
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars -- //! fix this, typescript fails
            callback: ((interaction, flow, designMessage, _) => {
              flow.disabled = true;
              interaction.update(designMessage());
            }) as ButtonComponentCallback,
          },
      ],
    ],
    getStatus: () => "complete",
  },
];

export default steps;
