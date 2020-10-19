const config = require("../../config.json"), mongoose = require("mongoose"), global = require("./global.js"), { getDateFormatted } = require("../constants/time.js");

const dbCache = new Map(), dbSaveQueue = new Map();

const guildObject = {
  guildid: "", // the guild ID
  channel: "", // the counting channel ID
  count: 0, // the current count
  user: "", // the current count's user
  modules: [], // the guild's modules
  notifications: {}, // the guild's users' notifications
  roles: {}, // the guild's roles
  topic: "", // the topic
  message: "", // the current count's ID
  prefix: "", // the prefix
  users: {}, // the users' amount of counts
  timeoutrole: {}, // a role given when the user fails X amount of times within Y seconds (role, time, fails, duration "permanent" or seconds)
  timeouts: {}, // log how long the users will have the role
  regex: [], // regex filters, for the talking module
  pins: {}, // the guild's pin triggers,
  liveboard: {}, // the guild's live leaderboard location (premium)
  log: {} // the guild's confirmed counts the last week, ex { "YYYY-MM-DD": 1234 }
};

const guildSchema = mongoose.Schema(Object.assign({}, guildObject), { minimize: true }); // make a copy of guildObject
const Guild = mongoose.model("Guild", guildSchema);

const get = (guildid) => new Promise((resolve, reject) => Guild.findOne({ guildid }, (err, guild) => {
  if (err) return reject(err);
  if (!guild) {
    guild = new Guild(Object.assign({}, guildObject));
    guild.guildid = guildid;
  }
  return resolve(guild)
}))

const load = (guildid) => new Promise(async (resolve, reject) => {
  let guild = await get(guildid), guildCache = {}
  for (const key in guildObject) guildCache[key] = guild[key] || guildObject[key]; // if there's no value stored in the guild database then we use the default value
  return resolve(dbCache.set(guildid, guildCache))
});

const save = async (guildid, changes) => {
  if (!dbSaveQueue.has(guildid)) {
    dbSaveQueue.set(guildid, changes);
    let guild = await get(guildid), guildCache = dbCache.get(guildid), guildSaveQueue = dbSaveQueue.get(guildid);
    for (const key of guildSaveQueue) guild[key] = guildCache[key];
    return guild.save().then(() => dbSaveQueue.delete(guildid)).catch(console.log)
  } else dbSaveQueue.get(guildid).push(...changes)
}

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
      save(guildid, [ key ])
    },
    setMultiple: (changes) => {
      let guildCache = dbCache.get(guildid);
      for (const key in changes) guildCache[key] = changes[key];

      save(guildid, Object.keys(changes))
    },
    reset: () => {
      let guildCache = dbCache.get(guildid);
      Object.assign(guildCache, guildObject);
      guildCache.guildid = guildid;

      save(guildid, Object.keys(guildObject))
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
        while (Object.keys(guildCache.log).length > 7) delete guildCache.log[Object.keys(guildCache.log)[0]] // delete the oldest log
      }
      savedGuilds[gid].log[dateFormat] += 1;

      save(guildid, ["count", "user", "users", "log"])

      // checking rolerewards
      for (const rid in guildCache.roles) try {
        const role = guildCache.roles[rid], guildRole = client.guilds.get(guildid).roles.get(role ? role.role : null);
        if (role && guildRole && (
          role.mode == "only" && guildCache.count == role.count ||
          role.mode == "each" && guildCache.count % role.count == 0 ||
          role.mode == "score" && guildCache.users[member.id] == role.count
        )) {
          if (role.duration == "temporary") guildRole.members.filter(m => m.id !== member.id).forEach(m => m.roles.remove(guildRole, `Role Reward ${rid}`));
          member.addRole(guildRole, `Role Reward ${rid}`);
        }
      } catch(e) {}

      global.addCount()
    },
    afterCount: async (count, member, message) => {
      let guildCache = dbCache.get(guildid), guild = client.guilds.get(guildid);
      guildCache.message = message.id;

      let countMessage = message;

      // checking pintriggers
      let pin = Object.values(guildCache.pins).find(pin => (
        pin.mode == "only" && pin.count == count ||
        pin.mode == "each" && pin.count % count == 0
      ))
      if (pin) try {
        let pinned = await message.channel.fetchPinnedMessages().catch(() => ({ size: 0 }));
        if (pinned.size == 50) await pinned.last().unpin().catch();

        if (message.author.bot) message.pin(); // already reposted
        else if (pin.action == "repost") {
          countMessage = await message.channel.send(/*todo*/)
          if (guildCache.message == message.id) guildCache.message = countMessage.id;
          countMessage.pin()
          message.delete()
        } else message.pin();
      } catch(e) {}

      // checking notifications
      for (const nid in guildCache.notifications) {
        const notification = guildCache.notifications[nid];
        if (notification && (
          notification.mode == "only" && notification.count == count ||
          notification.mode == "each" && notification.count % count == 0
        )) {
          try {
            let notifier = await guild.members.fetch(notification.user)
            if (notifier) notifier.send({
              embed: {
                description: `🎉 ${guild} reached ${count} total counts!\nThe user who sent it was ${member}.\n\n[**→ Click here to jump to the message!**](${countMessage.url})`,
                color: config.color,
                thumbnail: {
                  url: member.user.displayAvatarURL({ dynamic: true, size: 512 })
                },
                footer: {
                  text: `Notification ID ${nid}`
                }
              }
            }).catch()
          } catch(e) {}
          if (notification.mode == "only") delete guildObject.notifications[nid];
        }
      }

      save(guildid, ["message", "notifications"])
    },

    // miscellaneous
    // TODO miscellaneous
  }
})