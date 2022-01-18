import { ApplicationCommandOptionChoice, ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction, ContextMenuInteraction, Message, MessageOptions } from "discord.js";
import { GuildDocument } from "../database/models/Guild";
import { SlashArgRecord } from "../handlers/interactions/commands";

type Command = {
  disableInCountingChannel?: boolean;
  premiumOnly?: boolean;
  requireSelectedCountingChannel?: boolean;
}

export type Autocomplete = (query: string | number, interaction: AutocompleteInteraction, document: GuildDocument, selectedCountingChannel?: string) => Promise<Array<ApplicationCommandOptionChoice>>;

export type SlashCommand = Command & {
  description: string;
  options?: Array<ApplicationCommandOptionData>;
  autocompletes?: {
    [optionName: string]: Autocomplete;
  }
  execute(interaction: CommandInteraction, ephemeralPreference: boolean, args: SlashArgRecord, document: GuildDocument, selectedCountingChannel?: string): Promise<void>;
};

export type ContextMenuCommand = Command & {
  execute(interaction: ContextMenuInteraction, ephemeralPreference: boolean, target: string, document: GuildDocument, selectedCountingChannel?: string): Promise<void>;
}

export type MentionCommand = Command & {
  execute(message: Message, reply: (options: string | MessageOptions) => Promise<Message>, args: Array<string>, document: GuildDocument, selectedCountingChannel?: string): Promise<Message>;
  aliases?: Array<string>;
  minArguments?: number;
};
