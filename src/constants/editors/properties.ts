import type { AnySelectMenuInteraction, ButtonInteraction, InteractionReplyOptions, InteractionUpdateOptions, ModalSubmitInteraction, Snowflake } from "discord.js";
import { ButtonStyle, ComponentType, InteractionType } from "discord.js";
import type { Property } from "../properties";
import { buttonComponents } from "../../handlers/interactions/components";

export default async function promptProperty<T extends Property, U = T extends Property<infer V> ? V : never>(interaction: AnySelectMenuInteraction<"cached"> | ButtonInteraction<"cached">, userId: Snowflake, property: T, currentValue?: U): Promise<[ data: null | U, nextInteraction: ButtonInteraction<"cached"> ]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [value, newInteraction] = await property.input(interaction, currentValue);
  const converted = await property.convert(value, interaction.guild) as null | U;

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

      buttonComponents.set(`${interaction.id}:try_again`, {
        allowedUsers: [userId],
        callback(button) {
          void promptProperty(button, userId, property, currentValue).then(resolve);
        },
      });

      buttonComponents.set(`${interaction.id}:cancel`, {
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

    buttonComponents.set(`${interaction.id}:yes`, {
      allowedUsers: [userId],
      callback(button) {
        resolve([converted, button]);
      },
    });

    buttonComponents.set(`${interaction.id}:no`, {
      allowedUsers: [userId],
      callback(button) {
        void promptProperty(button, userId, property, value).then(resolve);
      },
    });
  });
}

function reply(interaction: AnySelectMenuInteraction<"cached"> | ButtonInteraction<"cached"> | ModalSubmitInteraction<"cached">, original: AnySelectMenuInteraction<"cached"> | ButtonInteraction<"cached">, options: InteractionReplyOptions & InteractionUpdateOptions): void {
  if (interaction.type === InteractionType.MessageComponent) return void interaction.update(options);
  void interaction.deferReply().then(() => void interaction.deleteReply());
  return void original.message.edit(options);
}
