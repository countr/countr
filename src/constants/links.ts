import { countingChannelPermissions, countingChannelRootPermissions } from "./discord";
import type { Client } from "discord.js";
import { OAuth2Scopes } from "discord.js";

// general
export const homepage = "https://countr.xyz";

// documentation
export const docsUrl = `${homepage}/docs`;
export const cacheHelpUrl = `${homepage}/caching`;
export const flowHelpUrl = `${homepage}/flows`;
export const regexHelpUrl = `${homepage}/regex`;
export const premiumHelpUrl = `${homepage}/premium`;

// miscellaneous
export const supportServerUrl = "https://promise.solutions/discord";
export const privacyUrl = `${homepage}/privacy`;
export const termsUrl = `${homepage}/terms`;
export const sourceUrl = "https://github.com/countr";
export const uptimeUrl = "https://uptime.countr.xyz";

// invite
export const inviteUrl = (client: Client): string => client.generateInvite({
  scopes: [
    OAuth2Scopes.Bot,
    OAuth2Scopes.ApplicationsCommands,
  ],
  permissions: [
    // basic permissions that some guilds have removed from the @everyone-role
    "ViewChannel",
    "ReadMessageHistory",
    "SendMessages",
    "SendMessagesInThreads",
    "EmbedLinks",
    "AttachFiles",

    // permissions required in a counting channel. optionally, the owner can add these manually to the counting channel. these are mainly added for a smoother experience.
    "ManageChannels",
    "ManageMessages",
    "ManageWebhooks",
    "ManageThreads",
    "CreatePrivateThreads",
    "CreatePublicThreads",

    // manage roles for flows to give out roles as a reward
    "ManageRoles",

    // extras if I forgot them here
    ...countingChannelPermissions,
    ...countingChannelRootPermissions,
  ],
});
