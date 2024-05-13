import { readdir } from "fs/promises";
import { join } from "path";
import { inspect } from "util";
import type { ApplicationCommandData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, Client } from "discord.js";
import { ApplicationCommandOptionType, ApplicationCommandType, InteractionType } from "discord.js";
import type { ChatInputCommand } from "../../commands/chatInput";
import { slashCommandPermissions } from "../../commands/chatInput";
import type { ContextMenuCommand } from "../../commands/menu";
import config from "../../config";
import { PermissionLevel, permissionLevels } from "../../constants/permissions";
import { getGuildDocument } from "../../database";
import { legacyImportDefault } from "../../utils/import";
import commandsLogger from "../../utils/logger/commands";
import autocompleteHandler from "./autocompletes";
import chatInputCommandHandler from "./chatInputCommands";
import componentHandler from "./components";
import contextMenuCommandHandler from "./contextMenuCommands";
import modalHandler from "./modals";

export default function handleInteractions(client: Client<true>): void {
  client.on("interactionCreate", async interaction => {
    if (!interaction.inGuild()) return void commandsLogger.debug(`Interaction ${interaction.id} is not in a guild`);
    if (!interaction.inCachedGuild()) return void commandsLogger.debug(`Interaction ${interaction.id} is not in a cached guild (guild ID ${interaction.guildId})`);

    if (interaction.type === InteractionType.ModalSubmit) return modalHandler(interaction);

    if (interaction.type === InteractionType.MessageComponent) {
      if (interaction.isButton() || interaction.isAnySelectMenu()) componentHandler(interaction);
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

  commandsLogger.debug("Interaction command listener registered.");
}

export function registerCommands(client: Client<true>): void {
  const commands = config.guild ? client.guilds.cache.get(config.guild)!.commands : client.application.commands;
  void Promise.all([
    nestCommands("../../commands/chatInput", "CHAT_INPUT"),
    nestCommands("../../commands/menu", "MENU"),
  ])
    .then(([chatInputCommands, contextMenuCommands]) => commands.set([...chatInputCommands, ...contextMenuCommands]))
    .then(() => void commandsLogger.info("Interaction commands have been set."))
    .catch((err: unknown) => void commandsLogger.error(`Error while setting interaction commands: ${inspect(err)}`));
}

async function nestCommands(relativePath: string, type: "CHAT_INPUT" | "MENU"): Promise<ApplicationCommandData[]> {
  const files = await readdir(join(__dirname, relativePath));
  const arr: ApplicationCommandData[] = [];
  for (const fileName of files.filter(file => !file.startsWith("_") && file !== "index.js")) {
    if (type === "MENU") {
      const command = await legacyImportDefault<ContextMenuCommand>(require.resolve(`${relativePath}/${fileName}`));
      if (!command.premiumOnly || config.isPremium) {
        arr.push({
          name: fileName.split(".")[0]!,
          type: command.type,
          description: "",
          defaultMemberPermissions: permissionLevels[command.permissionRequired],
        });
      }
    }

    if (type === "CHAT_INPUT") {
      if (fileName.includes(".")) {
        const command = await legacyImportDefault<ChatInputCommand>(require.resolve(`${relativePath}/${fileName}`));
        const name = fileName.split(".")[0]!;
        if (!command.premiumOnly || config.isPremium) {
          arr.push({
            name,
            type: ApplicationCommandType.ChatInput,
            description: command.description,
            ...command.options && { options: command.options },
            defaultMemberPermissions: permissionLevels[slashCommandPermissions[name] ?? PermissionLevel.None],
          });
        }
      } else {
        const subCommands = await (async function nestSubCommands(relativeSubPath: string) {
          const subFiles = await readdir(join(__dirname, relativeSubPath));
          const subArr: Array<ApplicationCommandSubCommandData | ApplicationCommandSubGroupData> = [];
          for (const subFileName of subFiles.filter(file => !file.startsWith("_"))) {
            if (subFileName.includes(".")) {
              const command = await legacyImportDefault<ChatInputCommand>(require.resolve(`${relativeSubPath}/${subFileName}`));
              if (!command.premiumOnly || config.isPremium) {
                subArr.push({
                  type: ApplicationCommandOptionType.Subcommand,
                  name: subFileName.split(".")[0]!,
                  description: command.description,
                  options: command.options ?? [],
                });
              }
            } else {
              const subSubCommands = await nestSubCommands(join(relativeSubPath, subFileName));
              if (subSubCommands.length) {
                subArr.push({
                  type: ApplicationCommandOptionType.SubcommandGroup,
                  name: subFileName,
                  description: "Sub-command",
                  options: subSubCommands as never,
                });
              }
            }
          }
          return subArr;
        })(`${relativePath}/${fileName}`);
        if (subCommands.length) {
          arr.push({
            name: fileName,
            type: ApplicationCommandType.ChatInput,
            description: "Sub-command",
            options: subCommands,
            defaultMemberPermissions: permissionLevels[slashCommandPermissions[fileName] ?? PermissionLevel.None],
          });
        }
      }
    }
  }

  return arr;
}
