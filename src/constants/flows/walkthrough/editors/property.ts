import { FlowOptions } from "../../../../database/models/Guild";
import { MessageComponentInteraction } from "discord.js";
import { Property } from "../../../../types/flows/properties";
import { awaitingInput } from "../../../../commands/slash/flows/input";
import { components } from "../../../../handlers/interactions/components";
import config from "../../../../config";

export function editProperty(interaction: MessageComponentInteraction, property: Property, flowOptions: FlowOptions, propertyIndex: number | null): Promise<MessageComponentInteraction> {
  return new Promise((resolve, reject) => {
    awaitingInput.set([interaction.channelId, interaction.user.id].join("."), async (i, args) => {
      const arg = args[property.input.name] as string | number | undefined;
      if (arg === undefined) {
        return i.reply({
          content: `❌ You need to use the \`${property.input.name}\` argument to set the value of this property.\n> \`/flows input ${property.input.name}:INPUT_HERE\``,
          ephemeral: true,
        });
      }

      const value = property.convert && i.guild ? await property.convert(arg, i.guild) : arg;
      if (value === null) {
        return i.reply({
          embeds: [
            {
              title: property.short,
              description: property.help,
              color: config.colors.info,
            },
            {
              title: "Invalid value",
              description: "The value you provided is invalid. Please try again using the same command.",
              color: config.colors.error,
            },
          ],
          ephemeral: true,
        });
      }

      awaitingInput.delete([interaction.channelId, interaction.user.id].join("."));

      components.set(`${i.id}:yes`, ii => {
        interaction.deleteReply();
        if (propertyIndex) flowOptions.data[propertyIndex] = value;
        else flowOptions.data.push(value);
        return void resolve(ii);
      });
      components.set(`${i.id}:no`, ii => {
        interaction.deleteReply();
        editProperty(ii, property, flowOptions, propertyIndex).then(resolve).catch(reject);
      });
      i.reply({
        embeds: [
          {
            title: property.short,
            description: property.help,
            color: config.colors.info,
          },
          {
            title: "Is this correct?",
            description: `> **${property.format && i.guild ? await property.format(value, i.guild) : value}**`,
            color: config.colors.warning,
          },
        ],
        components: [
          {
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                label: "Yes",
                customId: `${i.id}:yes`,
                style: "SUCCESS",
              },
              {
                type: "BUTTON",
                label: "No",
                customId: `${i.id}:no`,
                style: "DANGER",
              },
            ],
          },
        ],
      });
    });
    components.set(`${interaction.id}:cancel`, i => {
      awaitingInput.delete(i.user.id);
      void reject(i);
    });
    interaction.update({
      content: null,
      embeds: [
        {
          fields: [
            {
              name: property.short,
              value: property.help,
            },
            {
              name: "Set value with command",
              value: `\`\`\`/flows input ${property.input.name}:\`\`\``,
            },
          ],
          color: config.colors.info,
        },
      ],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              label: "Cancel property edit",
              customId: `${interaction.id}:cancel`,
              style: "DANGER",
            },
          ],
        },
      ],
    });
  });
}
