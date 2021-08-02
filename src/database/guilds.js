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
      duration: { type: Number, default: 0 }
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
    timeouts: { type: Map, of: Number, default: {} },
    filters: { type: [String], default: [] },
    liveboard: { type: {
      channelId: { type: String, required: true },
      messageId: { type: String, required: true }
    }, default: {} },
  }, default: {} },
  log: { type: Map, of: Number, default: {} }
});

// we can't save in parallell, so we have to queue up the saves to avoid throwing errors
// we can obviously do Guild.save() and then await that before saving again, but that's a bit of a pain to do across files and events
guildSchema.methods.safeSave = async function() {
  const queued = saveQueue.get(this.guildId);
  if (queued) await queued;

  const request = this.save();
  saveQueue.set(this.guildId, request);
  request.then(() => saveQueue.delete(this.guildId));

  return await request;
};

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