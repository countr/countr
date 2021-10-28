import { ApplicationCommandData, ApplicationCommandOption, ApplicationCommandOptionData, ApplicationCommandSubCommandData, ButtonInteraction, ChatInputApplicationCommandData, Client, CommandInteraction, ContextMenuInteraction, MessageApplicationCommandData, SelectMenuInteraction, UserApplicationCommandData } from "discord.js";
import fs from "fs";
import { join } from "path";
import config from "../../config";
import commandHandler from "./commands";
import contextMenuHandler from "./contextMenus";
import componentHandler from "./components";
import { get } from "../../database/guilds";

export default async (client: Client): Promise<void> => {
  const commands = config.guild ? client.guilds.cache.get(config.guild)?.commands : client.application?.commands;
  if (client.shard?.ids.includes(0)) commands?.set([
    ...(await nestCommands("../../commands/slash", "CHAT_INPUT") as Array<ApplicationCommandData>),
    ...(await nestCommands("../../commands/user", "USER") as Array<ApplicationCommandData>),
    ...(await nestCommands("../../commands/message", "MESSAGE") as Array<ApplicationCommandData>),
  ]);

  client.on("interactionCreate", async interaction => {
    if (interaction.isMessageComponent()) {
      if (interaction.isButton()) return componentHandler(interaction as ButtonInteraction);
      if (interaction.isSelectMenu()) return componentHandler(interaction as SelectMenuInteraction);
    }
    const document = interaction.guildId ? await get(interaction.guildId) : undefined;
    if (interaction.isCommand()) return commandHandler(interaction as CommandInteraction, document);
    if (interaction.isContextMenu()) return contextMenuHandler(interaction as ContextMenuInteraction, document);
  });
};

function nestCommands(relativePath: string, type: string): Promise<Array<ApplicationCommandData | ApplicationCommandOption>> {
  return new Promise(resolve => fs.readdir(join(__dirname, relativePath), async (err, files) => {
    if (err) return console.log(err);

    const arr = [];
    if (files) for (const file of files) {
      if (file.endsWith(".js") && !file.startsWith("_")) {

        const { description, options }: {
          description?: string;
          options?: Array<ApplicationCommandOption>;
        } = (await import(`${relativePath}/${file}`)).default;

        if (type == "USER") arr.push({
          type: "USER",
          name: file.replace(".js", "")
        } as UserApplicationCommandData);

        else if (type == "MESSAGE") arr.push({
          type: "MESSAGE",
          name: file.replace(".js", "")
        } as MessageApplicationCommandData);

        else if (type == "CHAT_INPUT") arr.push({
          type: "CHAT_INPUT",
          name: file.replace(".js", ""),
          description: description || "No description",
          options: options || []
        } as ChatInputApplicationCommandData);

        else if (type == "SUB_COMMAND") arr.push(({
          type: "SUB_COMMAND",
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
