import type { Client } from "discord.js";
import { OAuth2Scopes } from "discord.js";
import { countingChannelPermissions, countingChannelRootPermissions } from "./discord";

// general
export const homepage = "https://countr.xyz";

// documentation
export const docsUrl = `${homepage}/docs`;
export const cacheHelpUrl = `${docsUrl}/troubleshooting#role-member-caching`;
export const flowHelpUrl = `${docsUrl}/features/flows`;
export const regexHelpUrl = `${docsUrl}/features/regex-filters#test`;
export const premiumHelpUrl = `${docsUrl}/premium`;

// miscellaneous
export const supportServerUrl = "https://promise.solutions/discord";
export const privacyUrl = `${homepage}/privacy`;
export const termsUrl = `${homepage}/terms`;
export const sourceUrl = "https://github.com/countr";
export const uptimeUrl = "https://status.countr.xyz";

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
