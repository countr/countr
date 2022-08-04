import type { ButtonInteraction, InteractionReplyOptions, InteractionUpdateOptions, ModalSubmitInteraction, SelectMenuInteraction, Snowflake } from "discord.js";
import { ButtonStyle, ComponentType, InteractionType } from "discord.js";
import type { Property } from "../properties";
import { components } from "../../handlers/interactions/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function promptProperty<T extends Property<any, any>, U = T extends Property<infer V, any> ? V : never>(interaction: ButtonInteraction<"cached"> | SelectMenuInteraction<"cached">, userId: Snowflake, property: T, currentValue?: U): Promise<[ data: U | null, nextInteraction: ButtonInteraction<"cached"> ]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [value, newInteraction] = await property.input(interaction, currentValue);
  const converted = await property.convert(value, interaction.guild) as U | null;

  if (converted === null) {
    return new Promise(resolve => {
      reply(newInteraction, interaction, {
        content: "❌ That doesn't look like a valid value for this property.",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                label: "Try again",
                customId: `${interaction.id}:try_again`,
                style: ButtonStyle.Primary,
              },
              {
                type: ComponentType.Button,
                label: "Cancel",
                customId: `${interaction.id}:cancel`,
                style: ButtonStyle.Danger,
              },
            ],
          },
        ],
      });

      components.set(`${interaction.id}:try_again`, {
        type: "BUTTON",
        allowedUsers: [userId],
        callback(button) {
          void promptProperty(button, userId, property, currentValue).then(resolve);
        },
      });

      components.set(`${interaction.id}:cancel`, {
        type: "BUTTON",
        allowedUsers: [userId],
        callback(button) {
          resolve([null, button]);
        },
      });
    });
  }

  // await format outside of promise
  const formatted = await property.format(converted, interaction.guild);
  return new Promise(resolve => {
    reply(newInteraction, interaction, {
      content: `➿ Does this look right?\n>>> ${formatted}`,
      embeds: [],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              label: "Yes",
              customId: `${interaction.id}:yes`,
              style: ButtonStyle.Success,
            }, {
              type: ComponentType.Button,
              label: "No, try again",
              customId: `${interaction.id}:no`,
              style: ButtonStyle.Danger,
            },
          ],
        },
      ],
    });

    components.set(`${interaction.id}:yes`, {
      type: "BUTTON",
      allowedUsers: [userId],
      callback(button) {
        resolve([converted, button]);
      },
    });

    components.set(`${interaction.id}:no`, {
      type: "BUTTON",
      allowedUsers: [userId],
      callback(button) {
        void promptProperty(button, userId, property, value).then(resolve);
      },
    });
  });
}

function reply(interaction: ButtonInteraction<"cached"> | ModalSubmitInteraction<"cached"> | SelectMenuInteraction<"cached">, original: ButtonInteraction<"cached"> | SelectMenuInteraction<"cached">, options: InteractionReplyOptions & InteractionUpdateOptions): void {
  if (interaction.type === InteractionType.MessageComponent) return void interaction.update(options);
  void interaction.deferReply().then(() => void interaction.deleteReply());
  return void original.message.edit(options);
}
