import "dotenv/config";
import type { CacheWithLimitsOptions } from "discord.js";

// export config as a constant value
export default {
  client: {
    token: String(process.env["BOT_TOKEN"]),
    caches: {
      ApplicationCommandManager: 0,
      BaseGuildEmojiManager: 0,
      GuildEmojiManager: 0,
      GuildMemberManager: { maxSize: 1, keepOverLimit: member => member.id === process.env["BOT_ID"] },
      GuildBanManager: 0,
      GuildInviteManager: 0,
      GuildScheduledEventManager: 0,
      GuildStickerManager: 0,
      MessageManager: 0,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      StageInstanceManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
      UserManager: { maxSize: 0, keepOverLimit: user => user.id === process.env["BOT_ID"] },
      VoiceStateManager: 0,
    } as CacheWithLimitsOptions,
  },
  databaseUri: String(process.env["DATABASE_URI"]),

  cluster: {
    id: parseInt(process.env["CLUSTER"] ?? "", 10) || 0,
    shards: process.env["SHARDS"]?.split(",").map(shardId => parseInt(shardId, 10)) ?? [0],
    shardCount: parseInt(process.env["SHARD_COUNT"] ?? "", 10) || 1,
  },

  owner: process.env["OWNER"] ?? "",
  admins: (process.env["ADMINS"] ?? "").split(","),
  guild: process.env["GUILD"] ?? null,

  api: {
    port: parseInt(process.env["API_PORT"] ?? "", 10) || null,
    numberOfProxies: parseInt(process.env["API_NUMBER_OF_PROXIES"] ?? "", 10) || 0,
  },

  websocket: {
    port: parseInt(process.env["WEBSOCKET_INTERNAL_PORT"] ?? "9900", 10),
    uri: process.env["WEBSOCKET_INTERNAL_URI"] ?? "ws://localhost:9900",
  },

  colors: {
    primary: parseInt(process.env["COLOR_PRIMARY"] ?? "BD4632", 16),
    success: parseInt(process.env["COLOR_SUCCESS"] ?? "43B581", 16),
    error: parseInt(process.env["COLOR_ERROR"] ?? "F14747", 16),
    warning: parseInt(process.env["COLOR_WARNING"] ?? "FAA619", 16),
    info: parseInt(process.env["COLOR_INFO"] ?? "5865F2", 16),
  },

  integrations: {
    ...process.env["WEBHOOK_URL"] && { webhook: process.env["WEBHOOK_URL"] },
  },

  ...process.env["ACCESS_ENABLED"] && {
    access: {
      interval: parseInt(process.env["ACCESS_INTERVAL"] ?? "", 10) || 30000,
      webhookLog: process.env["ACCESS_WEBHOOK_LOG"],
    },
  },

  statusPage: "https://uptime.countr.xyz",
  isPremium: process.env["IS_PREMIUM"] === "true",
  hastebinLink: process.env["HASTEBIN_LINK"] ?? "https://hastebin.but-it-actually.works",
} as const;
