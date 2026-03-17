import { ButtonStyle, ComponentType } from "discord.js";
import type { Step } from ".";
import limits from "../../../limits";
import { shortInput } from "../../../properties/inputs";

const step: Step = {
  title: "Optional details",
  description: "Here's some optional settings you can set, like a custom name. You can also disable it if you'd like.",
  fields: flow => [
    {
      name: "Name (optional)",
      value: flow.name ?? "*No name is set*",
      inline: true,
    },
    {
      name: "Status",
      value: flow.disabled ? "❌ Disabled" : "✅ Enabled",
      inline: true,
    },
    {
      name: "Randomize action",
      value: flow.actionIsRandomized ? "✅ Enabled" : "❌ Disabled",
      inline: true,
    },
    {
      name: "All triggers must pass",
      value: flow.allTriggersMustPass ? "✅ Enabled" : "❌ Disabled",
      inline: true,
    },
  ],
  /* eslint-disable camelcase -- custom_id instead of customId :( */
  components: ({ name, disabled, actionIsRandomized, allTriggersMustPass }) => [
    [
      {
        type: ComponentType.Button,
        ...name ?
          {
            label: "Remove name",
            style: ButtonStyle.Secondary,
          } :
          {
            label: "Set name",
            style: ButtonStyle.Primary,
          },
        custom_id: "set_name",
        async callback(button, designMessage, flow) {
          if (name) {
            delete flow.name;
            return void button.update(designMessage());
          }

          const inputHandler = shortInput("flow name", 2, 32);
          const [result, interaction] = await inputHandler(button, name);

          if (result) flow.name = result;
          void interaction.deferReply().then(() => void interaction.deleteReply());
          return void button.message.edit(designMessage());
        },
      },
      {
        type: ComponentType.Button,
        ...disabled ?
          {
            label: "Enable the flow",
            style: ButtonStyle.Primary,
          } :
          {
            label: "Disable the flow",
            style: ButtonStyle.Secondary,
          },
        custom_id: "toggle_flow",
        callback(button, designMessage, flow, countingChannel) {
          if (disabled && Array.from(countingChannel.flows.values()).filter(_flow => !_flow.disabled).length >= limits.flows.amount) {
            return void button.reply({
              content: `❌ You can only have **${limits.flows.amount}** flows enabled at a time.`,
              ephemeral: true,
            });
          }

          flow.disabled = !disabled;
          return void button.update(designMessage());
        },
      },
      {
        type: ComponentType.Button,
        ...actionIsRandomized ?
          {
            label: "Disable action randomization",
            style: ButtonStyle.Secondary,
          } :
          {
            label: "Enable action randomization",
            style: ButtonStyle.Primary,
          },
        custom_id: "toggle_randomize",
        callback(button, designMessage, flow) {
          flow.actionIsRandomized = !actionIsRandomized;
          return void button.update(designMessage());
        },
      },
      {
        type: ComponentType.Button,
        ...allTriggersMustPass ?
          {
            label: "Disable meeting all triggers",
            style: ButtonStyle.Secondary,
          } :
          {
            label: "Enable meeting all triggers",
            style: ButtonStyle.Primary,
          },
        custom_id: "toggle_meet_all_triggers",
        callback(button, designMessage, flow) {
          flow.allTriggersMustPass = !allTriggersMustPass;
          return void button.update(designMessage());
        },
      },
    ],
  ],
  /* eslint-enable camelcase */
  getStatus: () => "complete",
};

export default { ...step } as Step;
