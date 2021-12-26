import { Guild, MessageComponentInteraction } from "discord.js";
import { Property, PropertyValue } from "../../../../types/flows/properties";
import { FlowOptions } from "../../../../database/models/Guild";
import { awaitingInput } from "../../../../commands/slash/flows/input";
import { components } from "../../../../handlers/interactions/components";
import config from "../../../../config";
import { joinListWithAnd } from "../../../../utils/text";

export function editProperty(interaction: MessageComponentInteraction, property: Property, flowOptions: FlowOptions, propertyIndex: number | null, data?: Array<PropertyValue>): Promise<MessageComponentInteraction> {
  const newData = data || [...flowOptions.data[propertyIndex || 0] || []]; // copy the data or use data from previous interaction

  return new Promise((resolve, reject) => {
    awaitingInput.set([interaction.channelId, interaction.user.id].join("."), async (i, args) => {
      const arg = args[property.input.name] as string | number | undefined;
      if (arg === undefined) {
        return i.reply({
          content: `❌ You need to use the \`${property.input.name}\` argument to set the value of this property.\n> \`/flows input ${property.input.name}:INPUT_HERE\``,
          ephemeral: true,
        });
      }

      const value = property.convert ? await property.convert(arg, i.guild as Guild) : arg;
      if (value === null || newData.includes(value)) {
        return i.reply({
          embeds: [
            {
              title: property.short,
              description: property.help,
              color: config.colors.info,
            },
            value === null ?
              {
                title: "Invalid value",
                description: "The value you provided is invalid. Please try again using the same command.",
                color: config.colors.error,
              } :
              {
                title: "Value already exists",
                description: "The value you provided already exists in this property. Please try again using the same command.",
                color: config.colors.error,
              },
          ],
          ephemeral: true,
        });
      }

      awaitingInput.delete([interaction.channelId, interaction.user.id].join("."));

      components.set(`${i.id}:yes`, ii => {
        newData.push(value);

        // loop back if it's allowing multiple properties. if not then just save and resolve
        if (property.isMultiple) editProperty(ii, property, flowOptions, propertyIndex, newData).then(resolve).catch(reject);
        else {
          if (propertyIndex) flowOptions.data[propertyIndex] = newData;
          else flowOptions.data.push(newData);
          resolve(ii);
        }
        interaction.deleteReply();
      });
      components.set(`${i.id}:no`, ii => {
        interaction.deleteReply();
        editProperty(ii, property, flowOptions, propertyIndex, newData).then(resolve).catch(reject);
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
            description: (property.format && i.guild ? await property.format([value], i.guild) : `${value}`).split("\n").map(line => `> **${line}**`).join("\n"),
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
      reject(i);
    });
    components.set(`${interaction.id}:save`, i => {
      awaitingInput.delete(i.user.id);
      if (propertyIndex) flowOptions.data[propertyIndex] = newData;
      else flowOptions.data.push(newData);
      resolve(i);
    });
    components.set(`${interaction.id}:clear_list`, i => {
      editProperty(i, property, flowOptions, propertyIndex, []).then(resolve).catch(reject);
    });
    (async () => interaction.update({
      content: null,
      embeds: [
        {
          fields: [
            {
              name: property.short,
              value: property.help,
              inline: true,
            },
            {
              name: property.isMultiple ? "List" : "Current value",
              value: (property.format && newData.length ? await property.format(newData, interaction.guild as Guild) : joinListWithAnd(newData.map(d => `${d}`))) || "*None*",
              inline: true,
            },
            {
              name: property.isMultiple ? "Add values with command" : "Set value with command",
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
            ...property.isMultiple ?
              [
                {
                  type: "BUTTON" as const,
                  label: "Save",
                  customId: `${interaction.id}:save`,
                  style: "SUCCESS" as const,
                  disabled: !newData.length,
                },
                {
                  type: "BUTTON" as const,
                  label: "Clear list",
                  customId: `${interaction.id}:clear_list`,
                  style: "SECONDARY" as const,
                  disabled: !newData.length,
                },
              ] :
              [],
          ],
        },
      ],
    }))();
  });
}
