import { ApplicationCommandOptionData, CommandInteraction, ContextMenuInteraction, Message } from "discord.js";
import { GuildDocument } from "../database/models/Guild";
import { SlashArgRecord } from "../handlers/interactions/commands";

type Command = {
  disableInCountingChannel?: boolean;
  premiumOnly?: boolean;
}

export type SlashCommand = Command & {
  description: string;
  options?: Array<ApplicationCommandOptionData>;
  execute(interaction: CommandInteraction, ephemeralPreference: boolean, args: SlashArgRecord, document?: GuildDocument): Promise<void>;
};

export type ContextMenuCommand = Command & {
  execute(interaction: ContextMenuInteraction, ephemeralPreference: boolean, target: ContextMenuInteraction["targetId"], document: GuildDocument): Promise<void>;
}

export type MentionCommand = Command & {
  execute(message: Message, args: Array<string>, document: GuildDocument): Promise<Message>;
  aliases?: Array<string>;
  minArguments?: number;
};
