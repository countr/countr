const mongoose = require("mongoose"), global = require("./global.js"), { getDateFormatted } = require("../constants/time.js");

const dbCache = new Map(), dbSaveQueue = new Map();

const guildObject = {
  guildid: "", // the guild ID
  channel: "", // the counting channel ID
  count: 0, // the current count
  user: "", // the current count's user
  modules: [], // the guild's modules
  notifications: {}, // the guild's users' notifications
  flows: {}, // the guild's flows
  message: "", // the current count's ID
  prefix: "", // the prefix
  users: {}, // the users' amount of counts
  timeoutrole: {}, // a role given when the user fails X amount of times within Y seconds (role, time, fails, duration "permanent" or seconds)
  timeouts: {}, // log how long the users will have the role
  regex: [], // regex filters, for the talking module
  liveboard: {}, // the guild's live leaderboard location (premium)
  log: {} // the guild's confirmed counts the last week, ex { "YYYY-MM-DD": 1234 }
};

const guildSchema = mongoose.Schema(JSON.parse(JSON.stringify(guildObject)), { minimize: true }); // make a copy of guildObject
const Guild = mongoose.model("Guild", guildSchema);

const get = (guildid) => new Promise((resolve, reject) => Guild.findOne({ guildid }, (err, guild) => {
  if (err) return reject(err);
  if (!guild) {
    guild = new Guild(JSON.parse(JSON.stringify(guildObject)));
    guild.guildid = guildid;
  }
  return resolve(guild);
}));

const load = async (guildid) => {
  let guild = await get(guildid), guildCache = {}, freshGuildObject = JSON.parse(JSON.stringify(guildObject)); // make a fresh one, to not make duplicates across guilds (for example on arrays and objects)
  for (const key in freshGuildObject) guildCache[key] = guild[key] || freshGuildObject[key]; // if there's no value stored in the guild database then we use the default value
  return dbCache.set(guildid, guildCache);
};

const save = async (guildid, changes) => {
  if (!dbSaveQueue.has(guildid)) {
    dbSaveQueue.set(guildid, changes);
    let guild = await get(guildid), guildCache = dbCache.get(guildid), guildSaveQueue = JSON.parse(JSON.stringify(dbSaveQueue.get(guildid)));
    for (const key of guildSaveQueue) guild[key] = guildCache[key];
    return guild.save().then(() => {
      let newSaveQueue = dbSaveQueue.get(guildid);
      if (newSaveQueue.length > guildSaveQueue.length) {
        dbSaveQueue.delete(guildid);
        save(guildid, newSaveQueue.filter(key => !guildSaveQueue.includes(key)));
      } else dbSaveQueue.delete(guildid);
    }).catch(console.log);
  } else dbSaveQueue.get(guildid).push(...changes);
};

module.exports = (client) => (async guildid => {
  if (!dbCache.has(guildid)) await load(guildid); // if the guild is unloaded for some reason, we load it
  return {

    // debugging
    reload: () => load(guildid),
    unload: () => dbCache.delete(guildid),

    // general access and modifications
    get: () => Object.assign({}, dbCache.get(guildid)),
    set: (key, value) => {
      dbCache.get(guildid)[key] = value;
      save(guildid, [ key ]);
    },
    setMultiple: (changes) => {
      let guildCache = dbCache.get(guildid);
      Object.assign(guildCache, changes);

      save(guildid, Object.keys(changes));
    },
    addToArray: (array, value) => {
      dbCache.get(guildid)[array].push(value);
      save(guildid, [ array ]);
    },
    removeFromArray: (array, value) => {
      dbCache.get(guildid)[array] = dbCache.get(guildid)[array].filter(aValue => aValue !== value);
      save(guildid, [ array ]);
    },
    setOnObject: (object, key, value) => {
      dbCache.get(guildid)[object][key] = value;
      save(guildid, [ object ]);
    },
    removeFromObject: (object, key) => {
      delete dbCache.get(guildid)[object][key];
      save(guildid, [ object ]);
    },
    reset: () => {
      let guildCache = dbCache.get(guildid);
      Object.assign(guildCache, guildObject);
      guildCache.guildid = guildid;

      save(guildid, Object.keys(guildObject));
    },

    // counting
    addToCount: (member) => {
      let guildCache = dbCache.get(guildid);
      guildCache.count++;
      guildCache.user = member.id;

      if (!guildCache.users[member.id]) guildCache.users[member.id] = 0;
      guildCache.users[member.id]++;

      let dateFormat = getDateFormatted(new Date());
      if (!guildCache.log[dateFormat]) {
        guildCache.log[dateFormat] = 0;
        while (Object.keys(guildCache.log).length > 7) delete guildCache.log[Object.keys(guildCache.log)[0]]; // delete the oldest log
      }
      guildCache.log[dateFormat] += 1;

      save(guildid, ["count", "user", "users", "log"]);

      // checking rolerewards
      for (const rid in guildCache.roles) try {
        const role = guildCache.roles[rid], guildRole = client.guilds.resolve(guildid).roles.resolve(role ? role.role : null);
        if (role && guildRole && (
          role.mode == "only" && guildCache.count == role.count ||
          role.mode == "each" && guildCache.count % role.count == 0 ||
          role.mode == "score" && guildCache.users[member.id] == role.count
        )) {
          if (role.duration == "temporary") guildRole.members.filter(m => m.id !== member.id).forEach(m => m.roles.remove(guildRole, `Role Reward ${rid}`));
          member.addRole(guildRole, `Role Reward ${rid}`);
        }
      } catch(e) { /* something went wrong */ }

      global.addCount();
    }
  };
});

module.exports.cacheAll = async (guilds = new Set()) => {
  let gdbs = await Guild.find({ $or: [...guilds].map(guildid => ({ guildid })) });
  return await Promise.all([...guilds].map(async guildid => {
    let
      guild = gdbs.find(db => db.guildid == guildid) || { guildid },
      guildCache = {},
      freshGuildObject = JSON.parse(JSON.stringify(guildObject)); // make a fresh one, to not make duplicates across guilds (for example on arrays and objects)
    for (const key in freshGuildObject) guildCache[key] = guild[key] || freshGuildObject[key]; // if there's no value stored in the guild database then we use the default value
    return dbCache.set(guildid, guildCache);
  }));
};