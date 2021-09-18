import { Config } from "./config";

export default {
  client: { // make an application at https://discord.com/developers/applications and turn it into a bot. fill in these values
    id: "",
    secret: "",
    token: "",
    shards: 0, // leave as-is if you're self-hosting.
    caches: {
      GuildMemberManager: 100
    }
  },
  database_uri: "mongodb://localhost/countr", // mongo database uri
  isPremium: true, // if you're self-hosting, feel free to leave this to true. yes, premium features are free if you self-host. feel free to support us though, read more @ docs.countr.xyz/#/premium

  // discord Ids, see https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID- for info on how to obtain them
  admins: [ "your discord id here" ], // admin user ids. note: first one is main bot owner
  guild: "", // discord guild id. alternatively null, but it's better to have it set if you're self-hosting.

  // express port, used for shard stats etc
  port: null,

  // embed colors. prefix with 0x for hex, for example 0x00FF00 = green
  colors: {
    primary: 0xBD4632,
    success: 0x43B581,
    error: 0xF14747,
    warning: 0xFAA619,
    info: 0x5865F2,
  },

  // if you want to integrate with your own code, feel free to fill these values. leaving them as null will disable them.
  integration: {
    webhook_url: "", // todo
  },

  // when self-hosting, you don't need this enabled. this links up with https://github.com/countr/access-manager and is not necessary. just make the bot private, it's easier for you to limit access that way.
  access: {
    enabled: false,
    interval: 30000,
    webhook_log: "",
  },

  // progress icons for flows
  progressIcons: {
    complete: "https://cdn.discordapp.com/emojis/843808197823430656.png",
    selected: "https://cdn.discordapp.com/emojis/862433276483731466.png",
    incomplete: "https://cdn.discordapp.com/emojis/749061463989289050.png",
  },

  // status page link
  statusPage: "https://uptime.countr.xyz",
} as Config;