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
  ],
  /* eslint-disable camelcase -- custom_id instead of customId :( */
  components: ({ name, disabled }) => [
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
          await interaction.reply(designMessage());
          return void button.message.delete();
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
    ],
  ],
  /* eslint-enable camelcase */
  getStatus: () => "complete",
};

export default { ...step } as Step;
