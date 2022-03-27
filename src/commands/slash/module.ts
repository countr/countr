import type { ButtonInteraction, InteractionReplyOptions, SelectMenuInteraction } from "discord.js";
import type { GuildDocument } from "../../database/models/Guild";
import type { SlashCommand } from ".";
import { components } from "../../handlers/interactions/components";
import config from "../../config";
import modules from "../../constants/modules";

const moduleList = Object.keys(modules);

export default {
  description: "Get a list of modules or enable/disable a specific module",
  options: Object.keys(modules).map(name => ({
    type: "BOOLEAN",
    name,
    description: `Enable or disable the module ${name}`,
  })),
  execute: (interaction, ephemeralPreference, changes, document, selectedCountingChannel) => {
    const enabledModules = document.channels.get(selectedCountingChannel)?.modules || [];
    const changingModules = Object.keys(changes);

    if (!changingModules.length) return interaction.reply({ ...generateMenu(enabledModules, document, interaction.id), ephemeral: ephemeralPreference });

    const diff: Array<string> = [];

    for (const name of changingModules) { // this is confusing so i made comments for once, i'm so proud of myself
      if (changes[name] && enabledModules.includes(name)) diff.push(`+++ ${name} (module already enabled)`); // if it already exists and user wants to add it, ignore
      else if (changes[name]) { // if it doesn't exist, but user wants to add it
        const incompatible = modules[name].incompatible?.find(module => enabledModules.includes(module));
        if (incompatible) diff.push(`*** ${name} (module incompatible with ${incompatible})`);
        else if (!enabledModules.includes(name)) {
          diff.push(`+ ${name}`);
          enabledModules.push(name);
        }
      } else if (!enabledModules.includes(name)) diff.push(`--- ${name} (module already disabled)`); // if it doesn't exist but user wants to remove it, ignore
      else { // if it exists but user wants to remove it
        diff.push(`- ${name}`);
        enabledModules.splice(enabledModules.indexOf(name), 1);
      }
    }

    document.safeSave(); // since we're using the same array for modules then we don't need to set it in the database again

    return interaction.reply({
      content: `✅ Updated modules for <#${selectedCountingChannel}>. Changes:`,
      embeds: [{ description: `\`\`\`diff\n${diff.join("\n")}\`\`\`` }],
      ephemeral: ephemeralPreference,
    });
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;

function generateMenu(enabledModules: Array<string>, document: GuildDocument, uniqueIdentifier: string): InteractionReplyOptions {
  components.set(`${uniqueIdentifier}:module`, i => i.update(generateModuleMenu(i as SelectMenuInteraction, enabledModules, document)));

  return {
    embeds: [
      {
        title: "Available modules",
        description: [
          "**Get more information about a module by using the dropdown below.**",
          `**Turn a module on with the dropdown or with the command, for example \`/modules ${moduleList[0]}:true\`.**`,
          "",
          ...moduleList.map(name => `${enabledModules.includes(name) ? "🔘" : "⚫"} \`${name}\` *${modules[name].short}*`),
        ].join("\n"),
        color: config.colors.primary,
      },
    ],
    components: [
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "SELECT_MENU",
            placeholder: "Read more about...",
            minValues: 1,
            maxValues: 1,
            options: moduleList.map(name => ({
              label: name,
              value: name,
              description: modules[name].short,
            })),
            customId: `${uniqueIdentifier}:module`,
          },
        ],
      },
    ],
  };
}

function generateModuleMenu(interaction: SelectMenuInteraction, enabledModules: Array<string>, document: GuildDocument): InteractionReplyOptions {
  const [name] = interaction.values;
  const { incompatible } = modules[name];

  components.set(`${interaction.id}:enable`, i_ => {
    const i = i_ as ButtonInteraction;
    if (incompatible && enabledModules.find(m => incompatible?.includes(m))) {
      return i.reply({
        content: `❌ The module \`${name}\` is incompatible with the following module(s): ${incompatible.map(m => `\`${m}\``).join(", ")}`,
        ephemeral: true,
      });
    }
    enabledModules.push(name);
    document.safeSave();

    i.update(generateModuleMenuReply(name, enabledModules, interaction.id));
  });

  components.set(`${interaction.id}:disable`, i_ => {
    const i = i_ as ButtonInteraction;
    enabledModules.splice(enabledModules.indexOf(name), 1);
    document.safeSave();

    i.update(generateModuleMenuReply(name, enabledModules, interaction.id));
  });

  components.set(`${interaction.id}:back`, i_ => {
    const i = i_ as ButtonInteraction;
    i.update(generateMenu(enabledModules, document, interaction.id));
  });

  return generateModuleMenuReply(name, enabledModules, interaction.id);
}

function generateModuleMenuReply(name: string, enabledModules: Array<string>, uniqueIdentifier: string): InteractionReplyOptions {
  const { short, long, image, incompatible } = modules[name];
  return {
    embeds: [
      {
        title: `Module Information • ${name}`,
        description: long || short + (incompatible ? `\n\n*Incompatible with modules ${incompatible.map(m => `\`${m}\``).join(", ")}*` : ""),
        ...image && { image: { url: image }},
        color: config.colors.primary,
      },
    ],
    components: [
      {
        type: "ACTION_ROW",
        components: [
          enabledModules.includes(name) ?
            {
              type: "BUTTON",
              label: "Module is enabled (click to disable)",
              customId: `${uniqueIdentifier}:disable`,
              style: "PRIMARY",
            } :
            {
              type: "BUTTON",
              label: "Module is disabled (click to enable)",
              customId: `${uniqueIdentifier}:enable`,
              style: "SECONDARY",
            },
          {
            type: "BUTTON",
            label: "Go back",
            customId: `${uniqueIdentifier}:back`,
            style: "SECONDARY",
          },
        ],
      },
    ],
  };
}
