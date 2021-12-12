import { ButtonComponentCallback } from "../../../types/flows/components";
import { Step } from "../../../types/flows/steps";
import actions from "../actions";
import { awaitingInput } from "../../../commands/slash/flows/input";
import { components } from "../../../handlers/interactions/components";
import { getTriggerOrActionComponents } from "./components";
import triggers from "../triggers";

const steps: Array<Step> = [
  {
    title: "Welcome to the flow editor!",
    description: () => "general information about the flow generator here", // todo
    getStatus: () => "complete",
    skipIfExists: true,
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
      return { name: `• ${i + 1}: ${action.short}`, value: action.explanation(data) };
    }),
    components: flow => getTriggerOrActionComponents("action", flow),
    getStatus: flow => flow.actions.length ? "complete" : "incomplete",
  }, // todo
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
            callback: ((interaction, flow, designMessage) => {
              flow.name = undefined;
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
            callback: ((interaction, flow, designNewMessage) => {
              awaitingInput.set([interaction.guildId, interaction.channelId, interaction.user.id].join("."), (i, args) => {
                let name = args["text"] as string | undefined;
                if (!name) {
                  return i.reply({
                    content: "❌ You need to use the `text\" argument to set the name.\n> \"/flows input text:INPUT_HERE`",
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
            callback: ((interaction, flow, designMessage) => {
              flow.disabled = undefined;
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
            callback: ((interaction, flow, designMessage) => {
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
