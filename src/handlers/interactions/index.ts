import type { ApplicationCommandData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, Client } from "discord.js";
import { ApplicationCommandOptionType, ApplicationCommandType, InteractionType } from "discord.js";
import type { ChatInputCommand } from "../../commands/chatInput";
import type { ContextMenuCommand } from "../../commands/menu";
import autocompleteHandler from "./autocompletes";
import chatInputCommandHandler from "./chatInputCommands";
import componentHandler from "./components";
import config from "../../config";
import contextMenuCommandHandler from "./contextMenuCommands";
import { getGuildDocument } from "../../database";
import { join } from "path";
import modalHandler from "./modals";
import { readdir } from "fs/promises";

export default function handleInteractions(client: Client<true>): void {
  const commands = config.guild ? client.guilds.cache.get(config.guild)!.commands : client.application.commands;
  if (config.cluster.shards.includes(0)) {
    void Promise.all([
      nestCommands("../../commands/chatInput", "CHAT_INPUT"),
      nestCommands("../../commands/menu", "MENU"),
    ]).then(([chatInputCommands, contextMenuCommands]) => commands.set([...chatInputCommands, ...contextMenuCommands]));
  }

  client.on("interactionCreate", async interaction => {
    if (!interaction.inCachedGuild()) return;

    if (interaction.type === InteractionType.ModalSubmit) return modalHandler(interaction);

    if (interaction.type === InteractionType.MessageComponent) {
      if (interaction.isButton() || interaction.isSelectMenu()) componentHandler(interaction);
      return;
    }

    const document = await getGuildDocument(interaction.guildId);

    if (interaction.type === InteractionType.ApplicationCommand) {
      if (interaction.isChatInputCommand()) void chatInputCommandHandler(interaction, document);
      if (interaction.isContextMenuCommand()) void contextMenuCommandHandler(interaction, document);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we should still type check this although it's not necessary
    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) return autocompleteHandler(interaction, document);
  });
}

async function nestCommands(relativePath: string, type: "CHAT_INPUT" | "MENU"): Promise<ApplicationCommandData[]> {
  const files = await readdir(join(__dirname, relativePath));
  const arr: ApplicationCommandData[] = [];
  for (const fileName of files.filter(file => !file.startsWith("_") && file !== "index.js")) {
    if (type === "MENU") {
      const { default: command } = await import(`${relativePath}/${fileName}`) as { default: ContextMenuCommand };
      arr.push({
        name: fileName.split(".")[0]!,
        type: command.type,
        description: "",
      });
    }

    if (type === "CHAT_INPUT") {
      if (fileName.includes(".")) {
        const { default: command } = await import(`${relativePath}/${fileName}`) as { default: ChatInputCommand };
        arr.push({
          name: fileName.split(".")[0]!,
          type: ApplicationCommandType.ChatInput,
          description: command.description,
          ...command.options && { options: command.options },
        });
      } else {
        const subCommands = await (async function nestSubCommands(relativeSubPath: string) {
          const subFiles = await readdir(join(__dirname, relativeSubPath));
          const subArr: Array<ApplicationCommandSubCommandData | ApplicationCommandSubGroupData> = [];
          for (const subFileName of subFiles.filter(file => !file.startsWith("_"))) {
            if (subFileName.includes(".")) {
              const { default: command } = await import(`${relativeSubPath}/${subFileName}`) as { default: ChatInputCommand };
              subArr.push({
                type: ApplicationCommandOptionType.Subcommand,
                name: subFileName.split(".")[0]!,
                description: command.description,
                options: command.options ?? [],
              });
            } else {
              subArr.push({
                type: ApplicationCommandOptionType.SubcommandGroup,
                name: subFileName,
                description: "Sub-command",
                options: await nestSubCommands(join(relativeSubPath, subFileName)) as never,
              });
            }
          }
          return subArr;
        })(`${relativePath}/${fileName}`);
        arr.push({
          name: fileName,
          type: ApplicationCommandType.ChatInput,
          description: "Sub-command",
          options: subCommands,
        });
      }
    }
  }

  return arr;
}
