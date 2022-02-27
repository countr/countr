import { ApplicationCommandData, ApplicationCommandOption, ApplicationCommandOptionData, ApplicationCommandSubCommandData, ButtonInteraction, ChatInputApplicationCommandData, Client, CommandInteraction, ContextMenuInteraction, MessageApplicationCommandData, SelectMenuInteraction, UserApplicationCommandData } from "discord.js";
import { Command } from "../../@types/command";
import autocompleteHandler from "./autocompletes";
import commandHandler from "./commands";
import componentHandler from "./components";
import config from "../../config";
import contextMenuHandler from "./contextMenus";
import { countrLogger } from "../../utils/logger/countr";
import fs from "fs";
import { get } from "../../database/guilds";
import { join } from "path";

export default async (client: Client): Promise<void> => {
  const commands = config.guild ? client.guilds.cache.get(config.guild)?.commands : client.application?.commands;
  if (config.cluster.shards.includes(0)) {
    commands?.set([
      ...await nestCommands("../../commands/slash", "CHAT_INPUT") as Array<ApplicationCommandData>,
      ...await nestCommands("../../commands/user", "USER") as Array<ApplicationCommandData>,
    ]);
  }

  client.on("interactionCreate", async interaction => {
    if (interaction.isMessageComponent()) {
      if (interaction.isButton()) return componentHandler(interaction as ButtonInteraction);
      if (interaction.isSelectMenu()) return componentHandler(interaction as SelectMenuInteraction);
    }

    if (interaction.isApplicationCommand()) {
      if (!interaction.guildId) return; // ignore DM interactions
      const document = await get(interaction.guildId);

      if (interaction.isCommand()) return commandHandler(interaction as CommandInteraction, document);
      if (interaction.isContextMenu()) return contextMenuHandler(interaction as ContextMenuInteraction, document);
    }

    if (interaction.isAutocomplete()) return autocompleteHandler(interaction);
  });
};

function nestCommands(relativePath: string, type: string): Promise<Array<ApplicationCommandData | ApplicationCommandOption>> {
  return new Promise(resolve => {
    fs.readdir(join(__dirname, relativePath), async (err, files) => {
      if (err) return countrLogger.error(err);

      const arr = [];
      if (files) {
        for (const file of files) {
          if (file.endsWith(".js") && !file.startsWith("_")) {

            const { description, options, premiumOnly }: {
              description?: string;
              options?: Array<ApplicationCommandOption>;
            } & Command = (await import(`${relativePath}/${file}`)).default;

            if (!premiumOnly || config.isPremium) {
              if (type === "USER") {
                arr.push({
                  type: "USER",
                  name: file.replace(".js", ""),
                } as UserApplicationCommandData);
              } else if (type === "MESSAGE") {
                arr.push({
                  type: "MESSAGE",
                  name: file.replace(".js", ""),
                } as MessageApplicationCommandData);
              } else if (type === "CHAT_INPUT") {
                arr.push({
                  type: "CHAT_INPUT",
                  name: file.replace(".js", ""),
                  description: description || "No description",
                  options: options || [],
                } as ChatInputApplicationCommandData);
              } else if (type === "SUB_COMMAND") {
                arr.push(({
                  type: "SUB_COMMAND",
                  name: file.replace(".js", ""),
                  description: description || "No description",
                  options: options || [],
                } as ApplicationCommandOptionData & ApplicationCommandSubCommandData) as ApplicationCommandOption);
              }
            }

          } else if (!file.includes(".")) {
            const options = await nestCommands(`${relativePath}/${file}`, "SUB_COMMAND") as Array<ApplicationCommandOption>;
            if (options.length) arr.push({ name: file, description: "Sub-command.", options, type: type === "SUB_COMMAND" ? "SUB_COMMAND_GROUP" : type } as ChatInputApplicationCommandData);
          }
        }
      }
      return resolve(arr);
    });
  });
}
