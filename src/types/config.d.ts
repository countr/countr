import { CacheWithLimitsOptions } from "discord.js";

export interface Config {
  client: {
    id: string,
    secret: string,
    token: string,
    shards: number | "auto",
    caches: CacheWithLimitsOptions
  },
  database_uri: string,
  isPremium?: boolean,

  admins: Array<string>,
  guild?: string | null,

  port?: number | null,

  colors: {
    primary: number,
    success: number,
    error: number,
    warning: number,
    info: number,
  },

  integration: {
    webhook_url?: string | null, // todo
  },

  access: {
    enabled: boolean,
    interval: number,
    webhook_log?: string,
  },

  progressIcons: {
    complete: string,
    selected: string,
    incomplete: string,
  },

  statusPage?: string | null,
}
