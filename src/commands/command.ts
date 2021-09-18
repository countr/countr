import { ApplicationCommandOptionData, CommandInteraction, ContextMenuInteraction } from "discord.js";
import { GuildDocument } from "../database/models/Guild";
import { SlashArgRecord } from "../handlers/interactions/commands";

export type SlashCommand = {
  description: string;
  options?: Array<ApplicationCommandOptionData>;
  execute(interaction: CommandInteraction, ephemeralPreference: boolean, args: SlashArgRecord, document?: GuildDocument): Promise<void>;
  workInPrivateMessage?: boolean;
};

export type ContextMenuCommand = {
  execute(interaction: ContextMenuInteraction, ephemeralPreference: boolean, document: GuildDocument): Promise<void>;
}