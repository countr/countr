import { parse } from "dotenv";
import { readFileSync } from "fs";
import { Config } from "./types/config";

const env = parse(readFileSync("./.env"));
const isDockerWithMongo = process.env.IS_THIS_DOCKER_WITH_MONGO == "yes";

export default {
  client: {
    token: env.BOT_TOKEN,
    shards: parseInt(env.BOT_SHARDS) || "auto",
    caches: {
      GuildMemberManager: 100
    }
  },
  database_uri: isDockerWithMongo ? "mongodb://db/countr" : env.DATABASE_URI,
  isPremium: env.IS_PREMIUM == "true",

  admins: (env.ADMINS || "").split(","),
  guild: env.GUILD || null,

  port: parseInt(env.API_PORT),

  colors: {
    primary: parseInt(env.COLOR_PRIMARY || "BD4632", 16),
    success: parseInt(env.COLOR_SUCCESS || "43B581", 16),
    error: parseInt(env.COLOR_ERROR || "F14747", 16),
    warning: parseInt(env.COLOR_WARNING || "FAA619", 16),
    info: parseInt(env.COLOR_INFO || "5865F2", 16),
  },

  integration: {
    webhook_url: env.WEBHOOK_URL || null, // todo
  },

  access: {
    enabled: env.ACCESS_ENABLED == "true",
    interval: parseInt(env.ACCESS_INTERVAL) || 30000,
    webhook_log: env.ACCESS_WEBHOOK_LOG || null,
  },

  statusPage: "https://uptime.countr.xyz",
} as Config;
