import type { InteractionReplyOptions, InteractionUpdateOptions, SelectMenuInteraction, Snowflake } from "discord.js";
import { ButtonStyle, ComponentType } from "discord.js";
import config from "../../config";
import modules from "../../constants/modules";
import type { CountingChannelSchema, GuildDocument } from "../../database/models/Guild";
import { components } from "../../handlers/interactions/components";
import type { ChatInputCommand } from ".";

const moduleList = Object.keys(modules) as Array<keyof typeof modules>;

const command: ChatInputCommand = {
  description: "Get a list of modules",
  requireSelectedCountingChannel: true,
  execute(interaction, ephemeral, document, [, countingChannel]) {
    return void interaction.reply(moduleListOverview(ephemeral, document, countingChannel, interaction.id, interaction.user.id));
  },
};

export default { ...command } as ChatInputCommand;

function moduleListOverview(ephemeral: boolean, document: GuildDocument, countingChannel: CountingChannelSchema, uniqueId: string, userId: Snowflake): InteractionReplyOptions & InteractionUpdateOptions {
  components.set(`${uniqueId}:module`, {
    type: "SELECT_MENU",
    allowedUsers: [userId],
    callback(interaction) {
      return void interaction.update(moduleDetails(interaction, ephemeral, document, countingChannel, interaction.id, userId));
    },
  });

  return {
    embeds: [
      {
        title: "Available modules",
        description: [
          "**Get more information about a module by using the dropdown below.**",
          "**Turn a module on with the dropdown by selecting a module and then enabling it.**",
          "",
          ...moduleList.map(name => `${countingChannel.modules.includes(name) ? "🔘" : "⚫"} \`${name}\` *${modules[name].description}*`),
        ].join("\n"),
        color: config.colors.primary,
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.SelectMenu,
            placeholder: "Configure modules...",
            minValues: 1,
            maxValues: 1,
            options: moduleList.map(name => ({
              label: name,
              value: name,
              description: modules[name].description,
            })),
            customId: `${uniqueId}:module`,
          },
        ],
      },
    ],
    ephemeral,
  };
}

function moduleDetails(interaction: SelectMenuInteraction, ephemeral: boolean, document: GuildDocument, countingChannel: CountingChannelSchema, uniqueId: string, userId: Snowflake): InteractionReplyOptions & InteractionUpdateOptions {
  const [name] = interaction.values as [keyof typeof modules];
  const { incompatible } = modules[name];

  components.set(`${uniqueId}:enable`, {
    type: "BUTTON",
    allowedUsers: [interaction.user.id],
    callback(button) {
      if (incompatible?.some(module => countingChannel.modules.includes(module))) {
        return void button.reply({
          content: `❌ The module \`${name}\` is incompatible with the following module(s): ${incompatible.map(module => `\`${module}\``).join(", ")}`,
          ephemeral: true,
        });
      }

      countingChannel.modules.push(name);
      document.safeSave();

      return void button.update(generateModuleMenuReply(name, countingChannel, uniqueId));
    },
  });

  components.set(`${uniqueId}:disable`, {
    type: "BUTTON",
    allowedUsers: [interaction.user.id],
    callback(button) {
      countingChannel.modules = countingChannel.modules.filter(module => module !== name);
      document.safeSave();

      return void button.update(generateModuleMenuReply(name, countingChannel, uniqueId));
    },
  });

  components.set(`${uniqueId}:back`, {
    type: "BUTTON",
    allowedUsers: [interaction.user.id],
    callback(button) {
      return void button.update(moduleListOverview(ephemeral, document, countingChannel, button.id, userId));
    },
  });

  return generateModuleMenuReply(name, countingChannel, uniqueId);
}

function generateModuleMenuReply(name: keyof typeof modules, countingChannel: CountingChannelSchema, uniqueId: string): InteractionReplyOptions & InteractionUpdateOptions {
  const { description, image, incompatible } = modules[name];
  return {
    embeds: [
      {
        title: `Module Information • ${name}`,
        description: description + (incompatible ? `\n\n*Incompatible with modules ${incompatible.map(module => `\`${module}\``).join(", ")}*` : ""),
        ...image && { image: { url: image } },
        color: config.colors.primary,
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          countingChannel.modules.includes(name) ?
            {
              type: ComponentType.Button,
              label: "Module is enabled (click to disable)",
              customId: `${uniqueId}:disable`,
              style: ButtonStyle.Primary,
            } :
            {
              type: ComponentType.Button,
              label: "Module is disabled (click to enable)",
              customId: `${uniqueId}:enable`,
              style: ButtonStyle.Secondary,
            },
          {
            type: ComponentType.Button,
            label: "Go back",
            customId: `${uniqueId}:back`,
            style: ButtonStyle.Secondary,
          },
        ],
      },
    ],
  };
}
