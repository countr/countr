import { ApplicationCommandData, ApplicationCommandOption, ApplicationCommandOptionData, ApplicationCommandSubCommandData, ChatInputApplicationCommandData, Client, CommandInteraction, ContextMenuInteraction, MessageApplicationCommandData, MessageComponentInteraction, UserApplicationCommandData } from "discord.js";
import fs from "fs";
import { join } from "path";
import config from "../../../config";
import commandHandler from "./commands";
import contextMenuHandler from "./contextMenus";
import componentHandler from "./components";
import { ApplicationCommandOptionTypes, ApplicationCommandTypes } from "discord.js/typings/enums";

export default async (client: Client): Promise<void> => {
  const commands = config.guild ? client.guilds.cache.get(config.guild)?.commands : client.application?.commands;
  commands?.set([
    ...(await nestCommands("../../commands/slash", "CHAT_INPUT") as Array<ApplicationCommandData>),
    ...(await nestCommands("../../commands/user", "USER") as Array<ApplicationCommandData>),
    ...(await nestCommands("../../commands/message", "MESSAGE") as Array<ApplicationCommandData>),
  ]);

  client.on("interactionCreate", interaction => {
    if (interaction.isCommand()) return commandHandler(interaction as CommandInteraction);
    if (interaction.isContextMenu()) return contextMenuHandler(interaction as ContextMenuInteraction);
    if (interaction.isMessageComponent()) return componentHandler(interaction as MessageComponentInteraction);
  });
};

function nestCommands(relativePath: string, type: string): Promise<Array<ApplicationCommandData | ApplicationCommandOption>> {
  return new Promise(resolve => fs.readdir(join(__dirname, relativePath), async (err?: unknown, files?: Array<string>) => {
    if (err) return console.log(err);

    const arr = [];
    if (files) for (const file of files) {
      if (file.endsWith(".js")) {

        const { description, options }: {
          description?: string;
          options?: Array<ApplicationCommandOption>;
        } = await import(`${relativePath}/${file}`);

        if (type == "USER") arr.push({
          type: ApplicationCommandTypes.USER,
          name: file.replace(".js", "")
        } as UserApplicationCommandData);

        else if (type == "MESSAGE") arr.push({
          type: ApplicationCommandTypes.MESSAGE,
          name: file.replace(".js", "")
        } as MessageApplicationCommandData);

        else if (type == "CHAT_INPUT") arr.push({
          type: ApplicationCommandTypes.CHAT_INPUT,
          name: file.replace(".js", ""),
          description: description || "No description",
          options: options || []
        } as ChatInputApplicationCommandData);

        else if (type == "SUB_COMMAND") arr.push(({
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: file.replace(".js", ""),
          description: description || "No description",
          options: options || []
        } as ApplicationCommandOptionData & ApplicationCommandSubCommandData) as ApplicationCommandOption);

      } else if (!file.includes(".")) {
        if (type == "SUB_COMMAND") type = "SUB_COMMAND_GROUP";
        const options = await nestCommands(`${relativePath}/${file}`, "SUB_COMMAND") as Array<ApplicationCommandOption>;
        arr.push({ name: file, description: "Sub-command.", options, type } as ChatInputApplicationCommandData);
      }
    }
    return resolve(arr);
  }));
}