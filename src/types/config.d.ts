import { CacheWithLimitsOptions } from "discord.js";

export interface Config {
  client: {
    id: string,
    secret: string,
    token: string,
    shards: number | "auto",
    caches: CacheWithLimitsOptions
  },
  databaseUri: string,
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
    webhookUrl?: string | null, // todo
  },

  access: {
    enabled: boolean,
    interval: number,
    webhookLog?: string,
  },

  progressIcons: {
    complete: string,
    selected: string,
    incomplete: string,
  },

  statusPage?: string | null,
}
