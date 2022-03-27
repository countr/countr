import type { ApplicationCommandData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, Client } from "discord.js";
import type { ContextMenuCommand } from "../../commands/menu";
import type { SlashCommand } from "../../commands/slash";
import autocompleteHandler from "./autocompletes";
import commandHandler from "./commands";
import componentHandler from "./components";
import config from "../../config";
import contextMenuHandler from "./contextMenus";
import { get } from "../../database/guilds";
import { join } from "path";
import { readdir } from "fs/promises";

export default async (client: Client): Promise<void> => {
  const commands = config.guild ? client.guilds.cache.get(config.guild)?.commands : client.application?.commands;
  if (config.cluster.shards.includes(0)) {
    commands?.set([
      ...await nestCommands("../../commands/slash", "SLASH"),
      ...await nestCommands("../../commands/menu", "MENU"),
    ]);
  }

  client.on("interactionCreate", async interaction => {
    if (interaction.isMessageComponent()) {
      if (interaction.isButton()) return componentHandler(interaction);
      if (interaction.isSelectMenu()) return componentHandler(interaction);
    }

    if (interaction.isApplicationCommand()) {
      if (!interaction.guildId) return; // ignore DM interactions
      const document = await get(interaction.guildId);

      if (interaction.isCommand()) return commandHandler(interaction, document);
      if (interaction.isContextMenu()) return contextMenuHandler(interaction, document);
    }

    if (interaction.isAutocomplete()) return autocompleteHandler(interaction);
  });
};

async function nestCommands(relativePath: string, type: "SLASH" | "MENU"): Promise<Array<ApplicationCommandData>> {
  const files = await readdir(join(__dirname, relativePath));
  const arr: Array<ApplicationCommandData> = [];
  for (const file of files.filter(file => !file.startsWith("_") && file !== "index.js")) {
    if (type === "MENU") {
      const command: ContextMenuCommand = (await import(`${relativePath}/${file}`)).default;
      arr.push({
        name: file.replace(".js", ""),
        type: command.type,
        description: "",
      });
    } else if (type === "SLASH") {
      if (file.endsWith(".js")) {
        const command: SlashCommand = (await import(`${relativePath}/${file}`)).default;
        arr.push({
          name: file.replace(".js", ""),
          type: "CHAT_INPUT",
          description: command.description,
          ...command.options && { options: command.options },
        });
      } else {
        const subCommands = await (async function nestSubCommands(relativePath: string) {
          const files = await readdir(join(__dirname, relativePath));
          const arr: Array<ApplicationCommandSubCommandData | ApplicationCommandSubGroupData> = [];
          for (const file of files.filter(file => !file.startsWith("_"))) {
            if (file.endsWith(".js")) {
              const command: SlashCommand = (await import(`${relativePath}/${file}`)).default;
              arr.push({
                type: "SUB_COMMAND",
                name: file.replace(".js", ""),
                description: command.description,
                options: command.options || [],
              });
            } else {
              arr.push({
                type: "SUB_COMMAND_GROUP",
                name: file,
                description: "Sub-command",
                options: await nestSubCommands(join(relativePath, file)) as never,
              });
            }
          }
          return arr;
        })(`${relativePath}/${file}`);
        arr.push({
          name: file,
          type: "CHAT_INPUT",
          description: "Sub-command",
          options: subCommands,
        });
      }
    }
  }
  return arr;
}
