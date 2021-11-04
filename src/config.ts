import { Config } from "./types/config";
import { config } from "dotenv";

const isDockerWithMongo = process.env.IS_THIS_DOCKER_WITH_MONGO === "yes";
config(); // load env variables

export default {
  client: {
    token: process.env.BOT_TOKEN,
    shards: parseInt(process.env.BOT_SHARDS || "") || "auto",
    clusters: parseInt(process.env.BOT_CLUSTERS || "") || "auto",
    caches: {
      GuildBanManager: 0,
      GuildEmojiManager: 0,
      GuildInviteManager: 0,
      GuildMemberManager: 100,
      GuildStickerManager: 0,
      MessageManager: 50,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      StageInstanceManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
      UserManager: 1, // bot only
      VoiceStateManager: 0,
    },
  },
  databaseUri: isDockerWithMongo ? "mongodb://db/countr" : process.env.DATABASE_URI,
  isPremium: process.env.IS_PREMIUM === "true",

  admins: (process.env.ADMINS || "").split(","),
  guild: process.env.GUILD || null,

  port: parseInt(process.env.API_PORT || ""),

  colors: {
    primary: parseInt(process.env.COLOR_PRIMARY || "BD4632", 16),
    success: parseInt(process.env.COLOR_SUCCESS || "43B581", 16),
    error: parseInt(process.env.COLOR_ERROR || "F14747", 16),
    warning: parseInt(process.env.COLOR_WARNING || "FAA619", 16),
    info: parseInt(process.env.COLOR_INFO || "5865F2", 16),
  },

  integration: {
    webhookUrl: process.env.WEBHOOK_URL || null, // todo
  },

  access: {
    enabled: process.env.ACCESS_ENABLED === "true",
    interval: parseInt(process.env.ACCESS_INTERVAL || "") || 30000,
    webhookLog: process.env.ACCESS_WEBHOOK_LOG || null,
  },

  statusPage: "https://uptime.countr.xyz",
} as Config;
