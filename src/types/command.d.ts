import { ApplicationCommandOptionData, CommandInteraction, ContextMenuInteraction, Message } from "discord.js";
import { GuildDocument } from "../database/models/Guild";
import { SlashArgRecord } from "../handlers/interactions/commands";

export type SlashCommand = {
  description: string;
  options?: Array<ApplicationCommandOptionData>;
  execute(interaction: CommandInteraction, ephemeralPreference: boolean, args: SlashArgRecord, document?: GuildDocument): Promise<void>;
  workInPrivateMessage?: boolean;
  disableInCountingChannel?: boolean;
};

export type ContextMenuCommand = {
  execute(interaction: ContextMenuInteraction, ephemeralPreference: boolean, target: ContextMenuInteraction["targetId"], document: GuildDocument): Promise<void>;
}

export type MentionCommand = {
  execute(message: Message, args: Array<string>, document?: GuildDocument): Promise<void>;
};