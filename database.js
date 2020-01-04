const mongoose = require("mongoose"), fetch = require("node-fetch");

let addCount = 0;

module.exports = (client, config) => {
  mongoose.connect(config.database_uri, { useNewUrlParser: true, useUnifiedTopology: true })

  setInterval(() => Global.findOne({}, (err, global) => {
    if (err) return;
    const { week } = dateInfo(new Date())

    if (!global) global = new Global({ counts: 0, week })

    global.counts += addCount; // prevents conflicts
    addCount = 0;

    if (global.week != week) {
      if (config.postToWebhookEveryWeek) fetch(config.postToWebhookEveryWeek, {
        method: "POST",
        body: JSON.stringify({ "value1": global.counts.toString(), "value2": global.week.toString() }), // the simplest way to integrate this is with IFTTT.
        headers: { "Content-Type": "application/json" }
      })

      global.counts = 0;
      global.week = week
    }

    global.save()
  }), 60000)

  return {
    refreshAllGuilds: async () => {
      let timenow = Date.now()

      let guilds = client.guilds.array();
      for (const guild of guilds) await cacheGuild(guild.id, true)

      return Date.now() - timenow;
    },
    global: {
      counts: () => new Promise(async function(resolve, reject) {
        Global.findOne({}, (err, global) => {
          if (err) return reject(err);
          const { week } = dateInfo(new Date())

          if (!global) global = new Global({ counts: 0, week })

          resolve(global.counts)
        })
      })
    },
    guild: gid => ({
      get: async () => await cacheGuild(gid),

      set: (key, value) => new Promise(async function(resolve, reject) {
        savedGuilds[gid][key] = value;

        let guild = await getGuild(gid);
        guild[key] = savedGuilds[gid][key];
        await guild.save().then(resolve).catch(reject);
        updateTopic(gid, client)
      }),

      setMultiple: (values) => new Promise(async function(resolve, reject) {
        for (const key in values) savedGuilds[gid][key] = values[key]

        let guild = await getGuild(gid);
        for (const key in values) guild[key] = savedGuilds[gid][key]
        await guild.save().then(resolve).catch(reject);
        updateTopic(gid, client)
      }),

      factoryReset: () => new Promise(async function(resolve, reject) {
        savedGuilds[gid] = guildObject;
        savedGuilds[gid].guildid = gid;
        
        let guild = await getGuild(gid);
        for (const key in guildObject) guild[key] = guildObject[key];
        await guild.save().then(resolve).catch(reject);
      }),

      addToCount: (member) => new Promise(async function(resolve, reject) {
        savedGuilds[gid].count += 1;
        savedGuilds[gid].user = member.id;
        
        if (!savedGuilds[gid].users[member.id]) savedGuilds[gid].users[member.id] = 0;
        savedGuilds[gid].users[member.id] += 1;

        let { format } = dateInfo(new Date())
        if (!savedGuilds[gid].log[format]) {
          savedGuilds[gid].log[format] = 0;

          let dates = Object.keys(savedGuilds[gid].log);
          while (dates.length > 7) {
            delete savedGuilds[gid].log[dates[0]] // delete the oldest log
            dates = Object.keys(savedGuilds[gid].log);
          }
        }
        savedGuilds[gid].log[format] += 1;

        // checking roles
        let roles = savedGuilds[gid].roles;
        for (const ID in roles) try {
          let role = roles[ID], gRole = client.guilds.get(gid).roles.get(role ? role.role : null)
          if (role && gRole && ((role.mode == "only" && savedGuilds[gid].count == role.count) || (role.mode == "each" && savedGuilds[gid].count % role.count == 0) || (role.mode == "score" && savedGuilds[gid].users[member.id] == role.count))) {
            if (role.duration == "temporary") gRole.members.filter(m => m.id !== member.id).forEach(m => m.removeRole(gRole, "Role Reward " + ID))
            member.addRole(gRole, "Role Reward " + ID)
          }
        } catch(e) {}

        addCount += 1;
              
        let guild = await getGuild(gid);
        guild.count = savedGuilds[gid].count;
        guild.user = savedGuilds[gid].user;
        guild.users = savedGuilds[gid].users;
        guild.log = savedGuilds[gid].log;
        await guild.save().then(resolve).catch(reject);
        updateTopic(gid, client);
      }),

      doStuffAfterCount: (count, member, message) => new Promise(async function(resolve, reject) {
        savedGuilds[gid].message = message.id;
        let { pins, notifications: notifs, channel } = savedGuilds[gid], g = client.guilds.get(gid);

        let pin = Object.keys(pins).find(p => (pins[p].mode == "only" && pins[p].count == count) || (pins[p].mode == "each" && count % pins[p].count == 0)), pinMessage = async m => m.pin().catch(async () => {
          let pinned = await m.channel.fetchPinnedMessages().catch(() => ({ size: 0 }))
          if (pinned.size == 50) await pinned.last().unpin().then(() => m.pin()).catch();
        })
        if (pin) try {
          if (message.author.bot) pinMessage(message); // already reposted
          else if (pins[pin].action == "repost") {
            message.delete();
            message.channel.awaitMessages(m => m.author.id == client.user.id && m.content.startsWith(message.content), { max: 1, time: 60000 }).then(msgs => pinMessage(msgs.first())) // it was the last count, so the bot will automatically resend it. (see app.js)
          } else pinMessage(message);
        } catch(e) {}
      
        for (const ID in notifs) {
          const notif = notifs[ID];
          if (notif && ((notif.mode == "only" && notif.count == count) || (notif.mode == "each" && count % notif.count == 0))) {
            try {
              g.members.get(notif.user).send({embed: {
                description: "🎉 " + g.name + " reached " + count + " total counts!\nThe user who sent it was " + member + ".\n\n[**→ Click here to jump to the message!**](https://discordapp.com/channels/" + [gid, channel, message.id].join("/") + ")",
                color: config.color,
                thumbnail: { url: member.user.displayAvatarURL.split("?")[0] },
                footer: { text: "Notification ID " + ID + (notif.mode == "each" ? " - Every " + notif.count : "") }
              }})
            } catch(e) {}

            if (notif.mode == "only") delete savedGuilds[gid].notifications[ID];
          }
        }

        let guild = await getGuild(gid);
        guild.message = savedGuilds[gid].message
        guild.notifications = savedGuilds[gid].notifications;
        guild.save().then(resolve).catch(reject)
      }),
      
      setScore: (user, score) => new Promise(async function(resolve, reject) {
        savedGuilds[gid].users[user] = score;
            
        let guild = await getGuild(gid);
        guild.users = savedGuilds[gid].users;
        guild.save().then(resolve).catch(reject);
      }),

      addRegex: (regex) => new Promise(async function(resolve, reject) {
        savedGuilds[gid].regex.push(regex);

        let guild = await getGuild(gid);
        guild.regex = savedGuilds[gid].regex;
        guild.save().then(resolve).catch(reject);
      }),

      removeRegex: (regex) => new Promise(async function(resolve, reject) {
        savedGuilds[gid].regex = savedGuilds[gid].regex.filter(r => r !== regex);
      
        let guild = await getGuild(gid);
        guild.regex = savedGuilds[gid].regex;
        guild.save().then(resolve).catch(reject);
      }),

      addTimeout: (user, duration) => new Promise(async function(resolve, reject) {
        savedGuilds[gid].timeouts[user] = Date.now() + duration * 1000;
      
        let guild = await getGuild(gid);
        guild.timeouts = savedGuilds[gid].timeouts;
        guild.save().then(resolve).catch(reject);
      }),

      toggleModule: (m) => new Promise(async function(resolve, reject) {
        if (savedGuilds[gid].modules.includes(m)) savedGuilds[gid].modules = savedGuilds[gid].modules.filter(str => str !== m);
        else savedGuilds[gid].modules.push(m);

        let guild = await getGuild(gid);
        guild.modules = savedGuilds[gid].modules
        guild.save().then(() => resolve(savedGuilds[gid].modules.includes(m))).catch(reject);
      }),

      setNotification: (ID, user, mode, count) => new Promise(async function(resolve, reject) {
        if (!user) delete savedGuilds[gid].notifications[ID];
        else savedGuilds[gid].notifications[ID] = { user, mode, count };

        let guild = await getGuild(gid);
        guild.notifications = savedGuilds[gid].notifications
        guild.save().then(resolve).catch(reject);
      }),

      setRole: (ID, role, mode, count, duration) => new Promise(async function(resolve, reject) {
        if (!role) delete savedGuilds[gid].roles[ID];
        else savedGuilds[gid].roles[ID] = { role, mode, count, duration };

        let guild = await getGuild(gid);
        guild.roles = savedGuilds[gid].roles
        guild.save().then(resolve).catch(reject);
      }),

      editRole: (ID, prop, value) => new Promise(async function(resolve, reject) {
        savedGuilds[gid].roles[ID][prop] = value;

        let guild = await getGuild(gid);
        guild.roles = savedGuilds[gid].roles
        guild.save().then(resolve).catch(reject);
      }),

      setPin: (ID, mode, count, action) => new Promise(async function(resolve, reject) {
        if (!mode) delete savedGuilds[gid].pins[ID];
        else savedGuilds[gid].pins[ID] = { mode, count, action };

        let guild = await getGuild(gid);
        guild.pins = savedGuilds[gid].pins
        guild.save().then(resolve).catch(reject);
      }),

      editPin: (ID, prop, value) => new Promise(async function(resolve, reject) {
        savedGuilds[gid].pins[ID][prop] = value;

        let guild = await getGuild(gid);
        guild.pins = savedGuilds[gid].pins
        guild.save().then(resolve).catch(reject);
      }),

      importScores: (scores, method) => new Promise(async function(resolve, reject) {
        if (method == "set") for (const id in scores) savedGuilds[gid].users[id] = scores[id]
        if (method == "add") for (const id in scores) {
          if (!savedGuilds[gid].users[id]) savedGuilds[gid].users[id] = 0
          savedGuilds[gid].users[id] += scores[id]
          if (savedGuilds[gid].users[id] < 0) savedGuilds[gid].users[id] = 0
        }

        let guild = await getGuild(gid);
        guild.users = savedGuilds[gid].users
        guild.save().then(resolve).catch(reject);
      })
    })
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
  liveboard: {}, // the guild's live leaderboard location (premium)
  log: {} // the guild's confirmed counts the last week, ex { "YYYY-MM-DD": 1234 }
}, guildSchema = mongoose.Schema(guildObject, { minimize: true })

const globalSchema = mongoose.Schema({
  counts: Number, week: Number
}, { minimize: false })

const Guild = mongoose.model("Guild", guildSchema), Global = mongoose.model("Global", globalSchema);

function updateTopic(gid, client) {
  return new Promise(async function(resolve) {
    const { topic, channel: cid, count } = await cacheGuild(gid);
    try {
      let channel = client.guilds.get(gid).channels.get(cid);
      if (topic == "") channel.setTopic("**Next count:** " + (count + 1)).then(resolve)
      else if (topic.includes("{{COUNT}}")) channel.setTopic(topic.replace("{{COUNT}}", count + 1)).then(resolve)
      else if (topic !== "disable") channel.setTopic(topic + " | **Next count:** " + (count + 1)).then(resolve)
    } catch(e) { console.log(e) && resolve(e) /* even if it errors, we still want to continue with our code. */ }
  })
}

let savedGuilds = {};
async function cacheGuild(gid, force) {
  if (!savedGuilds[gid] || force) {
    let guild = await getGuild(gid);
    savedGuilds[gid] = {};
    for (const prop in guildObject) savedGuilds[gid][prop] = guild[prop] || guildObject[prop]; // if the guild doesn't have all properties, we give it all properties.
  }
  return savedGuilds[gid];
}

function getGuild(gid) {
  return new Promise(function(resolve, reject) {
    Guild.findOne({ guildid: gid }, (err, guild) => {
      if (err) return reject(err);
      if (!guild) {
        let newGuild = new Guild(guildObject);
        newGuild.guildid = gid;

        return resolve(newGuild);
      } else return resolve(guild);
    })
  })
}

const dateInfo = d => ({ week: getWeek(d), format: getFormatted(d) })

function getWeek(d) {
  // https://stackoverflow.com/a/6117889
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  let week = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);

  return week;
}

function getFormatted(d) {
  // https://stackoverflow.com/a/23593099
  let month = (d.getMonth() + 1).toString(), day = d.getDate().toString(), year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-")
}

const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"; // base64

module.exports.generateID = alreadyGenerated => {
  let satisfied = false, id;

  while (!satisfied) {
    id = "";
    for (let i = 0; i < 6; i++) id = id + b64[Math.floor(Math.random() * b64.length)]
    if (!alreadyGenerated.includes(id)) satisfied = true;
  }

  return id;
}