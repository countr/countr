const mongoose = require("mongoose");

const guildObject = {
    guildid: "", // the guild ID
    channel: "", // the counting channel ID
    count: 0, // the current count
    user: "", // the current count's user
    modules: [], // the guild's modules
    notifications: {}, // the guild's users' notifications
    roles: {},// the guild's roles
    topic: "", // the topic
    message: "", // the current count's ID
    language: "", // the language
    prefix: "", // the prefix
    users: {} // the users' amount of counts
}

const guildSchema = mongoose.Schema(guildObject, { minimize: false })

const globalSchema = mongoose.Schema({
    counts: Number,
    week: Number
}, { minimize: false })

const Guild = mongoose.model("Guild", guildSchema);
const Global = mongoose.model("Global", globalSchema);

let savedGuilds = {}
let addCount = 0;

module.exports = function(client, config) {
    mongoose.connect(config.database_uri, { useNewUrlParser: true })
    return {
        getGuild: cacheGuild,

        setChannel(guildid, channelid) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                savedGuilds[guildid].channel = channelid;
              
                let guild = await getGuild(guildid);
                guild.channel = savedGuilds[guildid].channel;
                guild.save().then(resolve).catch(reject);
                updateTopic(guildid, client)
            });
        },

        getChannel(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(guild.channel)
            })
        },

        getUsers(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(guild.users)
            })
        },

        setScore(guildid, userid, score) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                savedGuilds[guildid].users[userid] = score;
              
                let guild = await getGuild(guildid);
                guild.users = savedGuilds[guildid].users;
                guild.save().then(resolve).catch(reject);
            })
        },

        addToCount(guildid, userid) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                savedGuilds[guildid].count += 1;
                savedGuilds[guildid].user = userid;
                
                if (!savedGuilds[guildid].users[userid]) savedGuilds[guildid].users[userid] = 0;
                savedGuilds[guildid].users[userid] += 1;
              
                let guild = await getGuild(guildid);
                guild.count = savedGuilds[guildid].count;
                guild.user = savedGuilds[guildid].user;
                guild.users = savedGuilds[guildid].users;
                await guild.save().then(resolve).catch(reject);
                updateTopic(guildid, client)

                addCount += 1;

                Global.findOne({}, (err, global) => {
                    if (err) return;
                    if (!global) global = new Global({
                        counts: 0,
                        week: getWeek(new Date())
                    })
        
                    global.counts += addCount; // prevents conflicts
                    addCount = 0;
        
                    if (global.week != getWeek(new Date())) {
                        global.counts = 1;
                        global.week = getWeek(new Date())
                    }
        
                    global.save()
                })
            })
        },

        getLastMessage(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(guild.message)
            })
        },

        setLastMessage(guildid, message) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                savedGuilds[guildid].message = message;
              
                let guild = await getGuild(guildid);
                guild.message = savedGuilds[guildid].message;
                await guild.save().then(resolve).catch(reject);
            })
        },

        getCount(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve({ "count": guild.count, "user": guild.user, "message": guild.message })
            })
        },

        setCount(guildid, count) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                savedGuilds[guildid].count = count;
                savedGuilds[guildid].user = "";
              
                let guild = await getGuild(guildid);
                guild.count = savedGuilds[guildid].count;
                guild.user = savedGuilds[guildid].user;
                await guild.save().then(resolve).catch(reject);
                updateTopic(guildid, client)
            })
        },

        toggleModule(guildid, moduleStr) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                if (savedGuilds[guildid].modules.includes(moduleStr)) savedGuilds[guildid].modules = savedGuilds[guildid].modules.filter(str => str !== moduleStr);
                else savedGuilds[guildid].modules.push(moduleStr);
    
                let guild = await getGuild(guildid);
                guild.modules = savedGuilds[guildid].modules
                guild.save().then(resolve).catch(reject);
            })
        },

        getModules(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(guild.modules);
            })
        },

        setNotification(guildid, ID, user, mode, count) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                if (!user) delete savedGuilds[guildid].notifications[ID];
                else savedGuilds[guildid].notifications[ID] = { user, mode, count };

                let guild = await getGuild(guildid);
                guild.notifications = savedGuilds[guildid].notifications
                guild.save().then(resolve).catch(reject);
            })
        },

        getNotifications(guildid, userid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                let IDs = {}
                for (var i in guild.notifications) if (guild.notifications[i]) if (guild.notifications[i].user == userid) IDs[i] = guild.notifications[i];
                resolve(IDs);
            })
        },

        notificationExists(guildid, ID) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(!!guild.notifications[ID]);
            })
        },

        checkNotifications(guildid, count, countUser, messageID, strings) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);

                let needSave = false;
                for (var ID in guild.notifications) {
                    if (guild.notifications[ID]) if ((guild.notifications[ID].mode == "only" && guild.notifications[ID].count == count) || (guild.notifications[ID].mode == "each" && Number.isInteger(count / guild.notifications[ID].count))) {
                        try {
                            client.guilds.get(guildid).members.get(guild.notifications[ID].user).send({
                                embed: {
                                    description: "🎉 " + strings["NOTIFICATION"].replace("{{GUILD}}", client.guilds.get(guildid).name).replace("{{COUNT}}", count).replace("{{MENTION}}", "<@!" + countUser + ">") + "\n\n[**→ " + strings["NOTIFICATION_LINK"] + "**](https://discordapp.com/channels/" + guildid + "/" + guild.channel + "/" + messageID + ")",
                                    color: config.color,
                                    thumbnail: {
                                        url: client.users.get(countUser).displayAvatarURL
                                    },
                                    footer: {
                                        text: strings["NOTIFICATION_ID"] + " " + ID + (guild.notifications[ID].mode == "each" ? " - " + strings["NOTIFICATION_EVERY"].replace("{{COUNT}}", guild.notifications[ID].count) : "")
                                    }
                                }
                              })
                        } catch (e) {/* If it didn't work, the user us either not in the guild anymore or has DMs disabled. */}
                        if (guild.notifications[ID].mode == "only") {
                            savedGuilds[guildid].notifications[ID] = null;
                            needSave = true;
                        }
                    }
                }

                if (needSave) {
                    let guild = await getGuild(guildid);
                    guild.notifications = savedGuilds[guildid].notifications;
                    guild.save().then(resolve).catch(reject)
                }
            })
        },

        setTopic(guildid, topic) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                if (["disable", "reset"].includes(topic)) savedGuilds[guildid].topic = topic;
                else savedGuilds[guildid].topic = topic + (topic.includes("{{COUNT}}") ? "" : " | **Next count:** {{COUNT}}");
              
                let guild = await getGuild(guildid);
                guild.topic = savedGuilds[guildid].topic;
                await guild.save().then(resolve).catch(reject);
                updateTopic(guildid, client)
            })
        },

        getTopic(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(guild.topic)
            })
        },

        setPrefix(guildid, prefix) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                savedGuilds[guildid].prefix = prefix;
              
                let guild = await getGuild(guildid);
                guild.prefix = savedGuilds[guildid].prefix;
                guild.save().then(resolve).catch(reject);
            })
        },

        getPrefix(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(guild.prefix || config.prefix)
            })
        },

        setRole(guildid, ID, role, mode, count, duration) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                if (!role) delete savedGuilds[guildid].roles[ID];
                else savedGuilds[guildid].roles[ID] = { role, mode, count, duration };

                let guild = await getGuild(guildid);
                guild.roles = savedGuilds[guildid].roles
                guild.save().then(resolve).catch(reject);
            })
        },

        editRole(guildid, ID, property, value) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                savedGuilds[guildid].roles[ID][property] = value;

                let guild = await getGuild(guildid);
                guild.roles[ID][property] = savedGuilds[guildid].roles[ID][property]
                guild.save().then(resolve).catch(reject);
            })
        },

        getRoles(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                let IDs = {}
                for (var ID in guild.roles) if (guild.roles[ID]) IDs[ID] = guild.roles[ID];
                resolve(IDs);
            })
        },

        roleExists(guildid, ID) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(!!guild.roles[ID]);
            })
        },
        
        checkRole(guildid, count, userid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                for (var ID in guild.roles) if (guild.roles[ID] && (guild.roles[ID].mode == "only" && guild.roles[ID].count == count) || (guild.roles[ID].mode == "each" && count%guild.roles[ID].count == 0) || (guild.roles[ID].mode == "score" && guild.users[userid] == guild.roles[ID].count)) try {
                    if (guild.roles[ID].duration == "temporary") client.guilds.get(guildid).roles.find(r => r.id == guild.roles[ID].role).members.filter(m => m.id != userid).forEach(member => { member.removeRole(client.guilds.get(guildid).roles.find(r => r.id == guild.roles[ID].role), "Role Reward " + ID) })
                    client.guilds.get(guildid).members.get(userid).addRole(client.guilds.get(guildid).roles.find(r => r.id == guild.roles[ID].role), "Role Reward " + ID);
                } catch(e) {}
                resolve();
            })
        },

        setPin(guildid, ID, mode, count, action) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                if (!mode) delete savedGuilds[guildid].pins[ID];
                else savedGuilds[guildid].pins[ID] = { mode, count, action };

                let guild = await getGuild(guildid);
                guild.pins = savedGuilds[guildid].pins
                guild.save().then(resolve).catch(reject);
            })
        },

        editPin(guildid, ID, property, value) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild(guildid);
                savedGuilds[guildid].pins[ID][property] = value;

                let guild = await getGuild(guildid);
                guild.pins[ID][property] = savedGuilds[guildid].pins[ID][property]
                guild.save().then(resolve).catch(reject);
            })
        },

        getPins(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                let IDs = {}
                for (var ID in guild.pins) if (guild.pins[ID]) IDs[ID] = guild.roles[ID];
                resolve(IDs);
            })
        },

        pinExists(guildid, ID) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(!!guild.pins[ID]);
            })
        },
        
        checkPin(guildid, count, message) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                for (var ID in guild.pins) if (guild.pins[i]) if ((guild.pins[ID].mode == "only" && guild.pins[ID].count == count) || (guild.pins[ID].mode == "each" && count%guild.pins[ID].count == 0)) try {
                    if (message.author.bot) return message.pin(); // already reposted
                    else if (guild.pins[i].action == "repost") return message.channel.send(count + " " + message.author.toString()).then(m => { m.pin(); message.delete(); }); else message.pin();
                } catch(e) {}
                resolve();
            })
        },

        getCounts() {
            return new Promise(async function(resolve, reject) {
                Global.findOne({}, (err, global) => {
                    if (err) return reject(err)
                    if (!global) global = new Global({
                        counts: 0,
                        week: getWeek(new Date())
                    })

                    resolve(global.counts)
                })
            })
        },

        getLanguage(guildid) {
            return new Promise(async function(resolve, reject) {
                let guild = await cacheGuild(guildid);
                resolve(guild.language || "en");
            })
        },

        setLanguage(guildid, lang) {
            return new Promise(async function(resolve, reject) {
                await cacheGuild();
                savedGuilds[guildid].language = lang;

                let guild = await getGuild(guldid);
                guild.language = savedGuilds[guildid].language;
                guild.save().then(resolve).catch(reject);
            })
        }
    }
}

function updateTopic(guildid, client) {
    return new Promise(async function(resolve, reject) {
        let guild = await cacheGuild(guildid);
        try {
            if (guild.topic == "") await client.guilds.get(guildid).channels.get(guild.channel).setTopic("**Next count:** " + (guild.count + 1))
            else if (guild.topic != "disable") await client.guilds.get(guildid).channels.get(guild.channel).setTopic(guild.topic.replace("{{COUNT}}", (guild.count + 1)))
        } catch(e) {/* if it didn't work, the bot did not have permissions to do it */}
        resolve(true);
    })
}

function getWeek(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    let weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

async function cacheGuild(guildid) {
    if (!savedGuilds[guildid]) {
        let guild = await getGuild(guildid);
        savedGuilds[guildid] = {};
        for (var property in guildObject) savedGuilds[guildid][property] = guild[property] ? guild[property] : guildObject[property]; // if the guild doesn't have the property yet, we try to add it
    }
    return savedGuilds[guildid];
}

function getGuild(guildid) {
    return new Promise(function(resolve, reject) {
        Guild.findOne({ guildid }, (err, guild) => {
            if (err) return reject(err);
            if (!guild) {
                let newGuild = new Guild(guildObject);
                newGuild.guildid = guildid;

                return resolve(newGuild);
            } else return resolve(guild);
        })
    })
}