const mongoose = require("mongoose"), Twitter = require("twitter");

module.exports = (client, config) => {
  mongoose.connect(config.database_uri, { useNewUrlParser: true })

  const twicli = new Twitter(config.twitterIntegration)
  function tweet(count, week) {
    if (!(config.twitterIntegration && config.twitterIntegration.enabled)) return;
    twicli.post("statuses/update", { status: config.twitterIntegration.message.replace("{{COUNT", count).replace("{{WEEK}}", week) })
  }

  setInterval(() => Global.findOne({}, (err, global) => {
    if (err) return;
    if (!global) global = new Global({
        counts: 0,
        week: getWeek(new Date())
    })

    global.counts += addCount; // prevents conflicts
    addCount = 0;

    if (global.week != getWeek(new Date())) {
      tweet(global.counts, global.week)
      global.counts = 1;
      global.week = getWeek(new Date())
    }

    global.save()
  }), 60000)

  return {
    global: {
      counts: () => new Promise(async function(resolve, reject) {
        Global.findOne({}, (err, global) => {
          if (err) return reject(err);
          if (!global) global = new Global({
            counts: 0,
            week: getWeek(new Date())
          })

          resolve(global.counts)
        })
      })
    },
    guild: async (gid) => {
      if (!savedGuilds[gid]) await cacheGuild(gid);
      return {
        get: async () => await cacheGuild(gid),

        set: (key, value) => new Promise(async function(resolve, reject) {
          savedGuilds[gid][key] = value;

          let guild = await getGuild(gid);
          guild[key] = savedGuilds[gid][key];
          await guild.save().then(resolve).catch(reject);
          updateTopic(gid, client)
        }),

        addToCount: (user) => new Promise(async function(resolve, reject) {
          savedGuilds[gid].count += 1;
          savedGuilds[gid].user = user;
          
          if (!savedGuilds[gid].users[user]) savedGuilds[gid].users[user] = 0;
          savedGuilds[gid].users[user] += 1;
                
          let guild = await getGuild(guildid);
          guild.count = savedGuilds[gid].count;
          guild.user = savedGuilds[gid].user;
          guild.users = savedGuilds[gid].users;
          await guild.save().then(resolve).catch(reject);
          updateTopic(guildid, client)

          addCount += 1;
        }),

        doStuffAfterCount: async (count, user, message) => Promise.all([
          async () => {
            savedGuilds[gid].message = message.id;

            let guild = await getGuild(guildid);
            guild.message = savedGuilds[gid].message;
            await guild.save().then(resolve).catch(reject);
          }, async () => {
            let pins = savedGuilds[gid].pins
            let pin = Object.keys(pins).find(p => (pins[p].mode == "only" && pins[p].count == count) || (pins[p].mode == "each" && count % pins[p].count == 0));

            if (pin) try {
              if (message.author.bot) message.pin(); // already reposted
              else if (pins[pin].action == "repost") {
                message.delete();
                message.channel.awaitMessages(m => m.author.id == client.user.id && m.content.startsWith(message.content), { max: 1, time: 60000 }).then(msgs => msgs.first().pin()) // it was the last count, so the bot will automatically resend it. (see app.js)
              } else message.pin();
            } catch(e) {}
          }, async () => {
            let {notifications: notifs, channel} = savedGuilds[gid], needSave = false;
            for (var ID in notifs) {
              let notif = notifs[ID];
              if (notif && ((notifs.mode == "only" && notifs.count == count) || (notifs.mode == "each" && count % notifs.count == 0))) {
                try {
                  let guild = client.guilds.get(gid);
                  guild.members.get(notifs.user).send({embed: {
                    description: "🎉 " + guild.name + " reached " + count + " total counts!\nThe user who sent it was <@!" + user + ">.\n\n[**→ Click here to jump to the message!**](https://discordapp.com/channels/" + [gid, channel, message.id].join("/") + ")",
                    color: config.color,
                    thumbnail: { url: client.users.get(countUser).displayAvatarURL.split("?")[0] },
                    footer: { text: "Notification ID " + ID + (notif.mode == "each" ? " - Every " + notif.count : "") }
                  }})
                } catch(e) {}

                if (notif.mode == "only") {
                  savedGuilds[gid].notifications[ID] = null;
                  needSave = true;
                }
              }
            }

            if (needSave) {
              let guild = await getGuild(gid);
              guild.notifications = savedGuilds[gid].notifications;
              guild.save().catch(e => new Error(e))
            }
          }
        ]),
        
        setScore: (user, score) => new Promise(async function(resolve, reject) {
          savedGuilds[gid].users[user] = score;
              
          let guild = await getGuild(guildid);
          guild.users = savedGuilds[gid].users;
          guild.save().then(resolve).catch(reject);
        }),

        addRegex: (regex) => new Promise(async function(resolve, reject) {
          savedGuilds[gid].regex.push(regex);

          let guild = await getGuild(guildid);
          guild.regex = savedGuilds[gid].regex;
          guild.save().then(resolve).catch(reject);
        }),

        removeRegex: (regex) => new Promise(async function(resolve, reject) {
          savedGuilds[gid].regex = savedGuilds[gid].regex.filter(r => r !== regex);
        
          let guild = await getGuild(guildid);
          guild.regex = savedGuilds[gid].regex;
          guild.save().then(resolve).catch(reject);
        }),

        addTimeout: (user, duration) => new Promise(async function(resolve, reject) {
          savedGuilds[gid].timeouts[user] = Date.now() + duration * 1000;
        
          let guild = await getGuild(guildid);
          guild.timeouts = savedGuilds[gid].timeouts;
          guild.save().then(resolve).catch(reject);
        }),

        toggleModule: (m) => new Promise(async function(resolve, reject) {
          if (savedGuilds[gid].modules.includes(m)) savedGuilds[gid].modules = savedGuilds[gid].modules.filter(str => str !== m);
          else savedGuilds[gid].modules.push(m);

          let guild = await getGuild(guildid);
          guild.modules = savedGuilds[gid].modules
          guild.save().then(resolve).catch(reject);
        }),

        setNotification: (ID, user, mode, count) => new Promise(async function(resolve, reject) {
          if (!user) delete savedGuilds[gid].notifications[ID];
          else savedGuilds[gid].notifications[ID] = { user, mode, count };

          let guild = await getGuild(guildid);
          guild.notifications = savedGuilds[gid].notifications
          guild.save().then(resolve).catch(reject);
        }),

        getNotifications: (user) => {
          let IDs = {};
          for (var ID in guild.notifications) {
            let notif = guild.notifications[ID]
            if (notif && notif.user == user) IDs[ID] = notif;
          }
          return IDs;
        },

        setRole: (ID, role, mode, count, duration) => new Promise(async function(resolve, reject) {
          if (!role) delete savedGuilds[guildid].roles[ID];
          else savedGuilds[guildid].roles[ID] = { role, mode, count, duration };

          let guild = await getGuild(guildid);
          guild.roles = savedGuilds[guildid].roles
          guild.save().then(resolve).catch(reject);
        }),

        editRole: (ID, prop, value) => new Promise(async function(resolve, reject) {
          savedGuilds[guildid].roles[ID][prop] = value;

          let guild = await getGuild(guildid);
          guild.roles[ID][prop] = savedGuilds[guildid].roles[ID][prop]
          guild.save().then(resolve).catch(reject);
        }),

        setPin: (ID, mode, count, action) => new Promise(async function(resolve, reject) {
          if (!mode) delete savedGuilds[guildid].pins[ID];
          else savedGuilds[guildid].pins[ID] = { mode, count, action };

          let guild = await getGuild(guildid);
          guild.pins = savedGuilds[guildid].pins
          guild.save().then(resolve).catch(reject);
        }),

        editPin: (ID, prop, value) => new Promise(async function(resolve, reject) {
          savedGuilds[guildid].pins[ID][prop] = value;

          let guild = await getGuild(guildid);
          guild.pins[ID][prop] = savedGuilds[guildid].pins[ID][prop]
          guild.save().then(resolve).catch(reject);
        })
      }
    }
  }
}

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
  liveboard: {} // the guild's live leaderboard location (premium)
}, guildSchema = mongoose.Schema(guildObject, { minimize: false })

const globalSchema = mongoose.Schema({
  counts: Number, week: Number
}, { minimize: false })

const Guild = mongoose.model("Guild", guildSchema), Global = mongoose.model("Global", globalSchema);

function updateTopic(gid, client) {
  return new Promise(function(resolve, reject) {
    let guild = await cacheGuild(gid);
    try {
      let channel = client.guilds.get(gid).channels.get(guild.channel);
      if (guild.topic == "") channel.setTopic("**Next count:** " + (guild.count + 1)).then(resolve)
      else if (guild.topic !== "disable") channel.setTopic(guild.topic.replace("{{COUNT}}", (guild.count + 1))).then(resolve)
    } catch(e) { resolve(e) /* even if it errors, we still want to continue with our code. */ }
  })
}

let savedGuilds = {};
async function cacheGuild(gid) {
  if (!savedGuilds[gid]) {
    let guild = await getGuild(gid);
    savedGuilds[gid] = {};
    for (var prop in guildObject) savedGuilds[gid][prop] = guild[prop] || guildObject[prop]; // if the guild doesn't have all properties, we give it all properties.
  }
  return savedGuilds[gid];
}

function getGuild(gid) {
  return new Promise(function(resolve, reject) {
    Guild.findOne({ guildid: gid }, (err, guild) => {
      if (err) return reject(err);
      if (!guild) {
        let newGuild = new Guild(guildObject);
        newGuild.guildid = guildid;

        return resolve(newGuild);
      } else return resolve(guild);
    })
  })
}

function getWeek(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  let weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}