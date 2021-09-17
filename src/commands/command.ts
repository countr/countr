import { ApplicationCommandOptionData, CommandInteraction, ContextMenuInteraction } from "discord.js";
import { GuildDocument } from "../database/models/Guild";
import { SlashArgRecord } from "../handlers/interactions/commands";

export type SlashCommand = {
  description: string;
  options?: Array<ApplicationCommandOptionData>;
  workInDms?: boolean;
  execute(interaction: CommandInteraction, ephemeralPreference: boolean, args: SlashArgRecord, document?: GuildDocument): Promise<void>;
};

export type ContextMenuCommand = {
  execute(interaction: ContextMenuInteraction, ephemeralPreference: boolean, document: GuildDocument): Promise<void>;
}