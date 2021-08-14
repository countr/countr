const mongoose = require("mongoose"), cache = new Map(), cacheQueue = new Map(), saveQueue = new Map();

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channels: { type: Map, of: {
    count: {
      number: { type: Number, default: 0 },
      userId: { type: String, default: "" },
      messageId: { type: String, default: "" },
    },
    type: { type: String, default: "decimal" },
    modules: { type: [String], default: [] },
    scores: { type: Map, of: Number, default: {} },
    timeoutRole: { type: {
      roleId: { type: String, required: true },
      fails: { type: Number, required: true },
      time: { type: Number, required: true },
      duration: { type: Number, default: null }
    }, default: {} },
    flows: { type: Map, of: {
      triggers: [{
        type: { type: String, required: true },
        data: { type: [/*any*/], default: [] }
      }],
      actions: [{
        type: { type: String, required: true },
        data: { type: [/*any*/], default: [] }
      }]
    }, default: {} },
    notifications: { type: Map, of: {
      userId: { type: String, required: true },
      mode: { type: String, default: "each" },
      count: { type: Number, required: true },
    }, default: {} },
    timeouts: { type: Map, of: Date, default: {} },
    filters: { type: [String], default: [] },
    liveboard: { type: {
      channelId: { type: String, required: true },
      messageId: { type: String, required: true }
    }, default: {} },
  }, default: {} },
  log: { type: Map, of: Number, default: {} }
});

// we can't save in parallell, and although we can await the guild.save(), that would not work across files.
guildSchema.methods.safeSave = safeSave;

// if saveQueue is undefined, set saveQueue to 1 and start saving
// if saveQueue exists, set saveQueue to 2 (if this gets called again, it will still only set to 2 and the modified data will join in on the next save. we don't need a third save because of this.)
// after saving, check if saveQueue is 2, if so then set it to 1 and start saving again, if not then set it to undefined
function safeSave() {
  if (!saveQueue.has(this.guildId)) {
    saveQueue.set(this.guildId, 1);
    this.save().then(() => {
      if (saveQueue.get(this.guildId) == 2) {
        saveQueue.delete(this.guildId);
        safeSave.call(this);
      } else saveQueue.delete(this.guildId);
    });
  } else saveQueue.set(this.guildId, 2);
}

const Guild = mongoose.model("Guild", guildSchema);

module.exports = {
  cache, // debug, if we ever need it in eval. this should not be used in production code
  get: async (guildId, fromCache = true) => {
    const guild = cache.get(guildId);
    if (fromCache && guild) return guild; else {
      const queued = cacheQueue.get(guildId);
      if (queued) return await queued;

      const request = new Promise((resolve, reject) => Guild.findOne({ id: guildId }, (err, guild) => {
        if (err) return reject(err);
  
        if (!guild) guild = new Guild({ guildId });
  
        cache.set(guildId, guild);
        cacheQueue.delete(guildId);
        return resolve(guild);
      }));
      cacheQueue.set(guildId, request);
      return await request;
    }
  },
  touch: (guildIds = []) => Guild.find({ $or: guildIds.map(guildId => ({ guildId })) }).then(guilds => guildIds.forEach(guildId => cache.set(guildId, guilds.find(guild => guild.guildId === guildId) || new Guild({ guildId })))),
  delete: guildId => Guild.deleteOne({ guildId }).then(() => cache.delete(guildId))
};