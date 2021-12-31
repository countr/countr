import { Config } from "./@types/config";
import { config } from "dotenv";
config(); // load env variables

export default {
  client: {
    token: process.env.BOT_TOKEN,
    caches: {
      GuildBanManager: 0,
      GuildEmojiManager: 0,
      GuildInviteManager: 0,
      GuildMemberManager: 500,
      GuildStickerManager: 0,
      MessageManager: 50,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      StageInstanceManager: 0,
      ThreadManager: 100,
      ThreadMemberManager: 0,
      UserManager: 1, // bot only
      VoiceStateManager: 0,
    },
  },
  cluster: {
    id: parseInt(process.env.CLUSTER || "") || 0,
    shards: process.env.SHARDS?.split(",").map(s => parseInt(s)) || [0],
    shardCount: parseInt(process.env.SHARD_COUNT || "") || 1,
  },
  databaseUri: process.env.DATABASE_URI,
  isPremium: process.env.IS_PREMIUM === "true",

  admins: (process.env.ADMINS || "").split(","),
  guild: process.env.GUILD || null,

  apiPort: parseInt(process.env.API_PORT || ""),
  apiUri: process.env.API_URI,

  colors: {
    primary: parseInt(process.env.COLOR_PRIMARY || "BD4632", 16),
    success: parseInt(process.env.COLOR_SUCCESS || "43B581", 16),
    error: parseInt(process.env.COLOR_ERROR || "F14747", 16),
    warning: parseInt(process.env.COLOR_WARNING || "FAA619", 16),
    info: parseInt(process.env.COLOR_INFO || "5865F2", 16),
  },

  integration: {
    webhookUrl: process.env.WEBHOOK_URL || null,
  },

  access: {
    enabled: process.env.ACCESS_ENABLED === "true",
    interval: parseInt(process.env.ACCESS_INTERVAL || "") || 30000,
    webhookLog: process.env.ACCESS_WEBHOOK_LOG || null,
  },

  statusPage: "https://uptime.countr.xyz",
} as Config;
