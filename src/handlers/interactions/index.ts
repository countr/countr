import type { ApplicationCommandData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, Client } from "discord.js";
import { ApplicationCommandOptionType, ApplicationCommandType, InteractionType } from "discord.js";
import { PermissionLevel, permissionLevels } from "../../constants/permissions";
import type { ChatInputCommand } from "../../commands/chatInput";
import type { ContextMenuCommand } from "../../commands/menu";
import autocompleteHandler from "./autocompletes";
import chatInputCommandHandler from "./chatInputCommands";
import componentHandler from "./components";
import config from "../../config";
import contextMenuCommandHandler from "./contextMenuCommands";
import { getGuildDocument } from "../../database";
import { inspect } from "util";
import { join } from "path";
import { mainLogger } from "../../utils/logger/main";
import modalHandler from "./modals";
import { readdir } from "fs/promises";
import { slashCommandPermissions } from "../../commands/chatInput";

export default function handleInteractions(client: Client<true>): void {
  const commands = config.guild ? client.guilds.cache.get(config.guild)!.commands : client.application.commands;
  if (config.cluster.shards.includes(0)) {
    void Promise.all([
      nestCommands("../../commands/chatInput", "CHAT_INPUT"),
      nestCommands("../../commands/menu", "MENU"),
    ])
      .then(([chatInputCommands, contextMenuCommands]) => commands.set([...chatInputCommands, ...contextMenuCommands]))
      .then(() => void mainLogger.info("Interaction commands have been set."))
      .catch(err => void mainLogger.error(`Error while setting interaction commands: ${inspect(err)}`));
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
        const { default: command } = await import(`${relativePath}/${fileName}`) as { default: ChatInputCommand };
        const name = fileName.split(".")[0]!;
        if (!command.premiumOnly || config.isPremium) {
          arr.push({
            name,
            type: ApplicationCommandType.ChatInput,
            description: command.description,
            ...command.options && { options: command.options },
            defaultMemberPermissions: permissionLevels[slashCommandPermissions[name] ?? PermissionLevel.NONE],
          });
        }
      } else {
        const subCommands = await (async function nestSubCommands(relativeSubPath: string) {
          const subFiles = await readdir(join(__dirname, relativeSubPath));
          const subArr: Array<ApplicationCommandSubCommandData | ApplicationCommandSubGroupData> = [];
          for (const subFileName of subFiles.filter(file => !file.startsWith("_"))) {
            if (subFileName.includes(".")) {
              const { default: command } = await import(`${relativeSubPath}/${subFileName}`) as { default: ChatInputCommand };
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
            defaultMemberPermissions: permissionLevels[slashCommandPermissions[fileName] ?? PermissionLevel.NONE],
          });
        }
      }
    }
  }

  return arr;
}
