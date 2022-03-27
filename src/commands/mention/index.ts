import type { Message, MessageOptions, Snowflake } from "discord.js";
import { docsUrl, inviteUrl, premiumHelpUrl, privacyUrl, sourceUrl, supportServerUrl, termsUrl, uptimeUrl } from "../../constants/links";
import type { GuildDocument } from "../../database/models/Guild";
import { PermissionLevel } from "../../constants/permissions";

export type MentionCommand = {
  aliases?: Array<string>;
  testArgs(args: Array<string>): boolean;
  disableInCountingChannel?: true;
  premiumOnly?: true;
} & ({
  requireSelectedCountingChannel?: never;
  execute(message: Message, reply: (options: string | MessageOptions) => Promise<Message>, args: Array<string>, document: GuildDocument, selectedCountingChannel?: Snowflake): Promise<Message>;
} | {
  requireSelectedCountingChannel: true;
  execute(message: Message, reply: (options: string | MessageOptions) => Promise<Message>, args: Array<string>, document: GuildDocument, selectedCountingChannel: Snowflake): Promise<Message>;
});

export const basics: Array<{
  triggers: Array<string>;
  message: string;
}> = [
  {
    triggers: ["invite", "inviteme", "addme"],
    message: `🔗 Invite me: <${inviteUrl}>`,
  },
  {
    triggers: ["support"],
    message: `🔗 Support server: <${supportServerUrl}>`,
  },
  {
    triggers: ["privacy", "privacypolicy"],
    message: `🔗 Privacy Policy: <${privacyUrl}>`,
  },
  {
    triggers: ["terms", "termsofservice", "tos"],
    message: `🔗 Terms of Service: <${termsUrl}>`,
  },
  {
    triggers: ["source", "sourcecode", "code", "git"],
    message: `🔗 Source code: ${sourceUrl}`,
  },
  {
    triggers: ["docs", "documentation"],
    message: `🔗 Documentation: ${docsUrl}`,
  },
  {
    triggers: ["uptime", "status"],
    message: `🔗 Uptime: ${uptimeUrl}`,
  },
  {
    triggers: ["premium", "buy"],
    message: `🔗 Learn about Premium here: ${premiumHelpUrl}`,
  },
];

export const permissions: Record<string, PermissionLevel> = {
  eval: PermissionLevel.BOT_DEVELOPER,
};
