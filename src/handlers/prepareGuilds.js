module.exports = async (disabledGuilds, client, db, shard) => {
  let startTimestamp = Date.now();
  await Promise.all(client.guilds.cache.map(guild => processGuild(guild, disabledGuilds, db)))
  return console.log(shard, `All ${client.guilds.cache.size} available guilds have been processed and is now ready for counting! [${Date.now() - startTimestamp}ms]`)
}

async function processGuild(guild, disabledGuilds, db) {
  const gdb = await db.guild(guild.id), { timeouts, timeoutrole, modules, channel: channelid, message: messageid } = await gdb.get();

  // timeouts
  for (let userid in timeouts) try {
    let member = guild.members.resolve(userid);
    if (!member) member = await guild.members.fetch(userid);
    if (member && member.partial) member = await member.fetch();
    if (member && member.roles.cache.get(timeoutrole.role)) {
      if (Date.now() >= timeouts[userid]) member.roles.remove(timeoutrole.role, "User no longer timed out (offline)").catch()
      else setTimeout(() => member.roles.remove(timeoutrole.role, "User no longer timed out").catch(), timeouts[userid] - Date.now())
    }
  } catch(e) {}

  // recover module
  if (modules.includes("recover")) try {
    let channel = guild.channels.resolve(channelid);
    if (channel && channel.partial) channel = await channel.fetch();
    if (channel) {
      let messages = await channel.messages.fetch({ limit: 1, after: messageid });
      if (messages.size) {
        const alert = await channel.send(`💢 Making channel ready for counting.`);
        if (!channel.permissionsFor(guild.me).has("SEND_MESSAGES")) await channel.updateOverwrite(guild.me, { SEND_MESSAGES: true });

        let defaultPermissions = channel.permissionOverwrites.get(guild.roles.everyone), oldPermission = null;
        if (defaultPermissions.allow.has("SEND_MESSAGES")) oldPermission = true;
        else if (defaultPermissions.deny.has("SEND_MESSAGES")) oldPermission = false;

        await channel.updateOverwrite(guild.roles.everyone, { SEND_MESSAGES: false }, "Making channel ready for counting");

        let processing = true, fail = false;
        while (processing) {
          let messages = await channel.messages.fetch({ limit: 100, after: messageid });
          messages = messages.filter(m => m.id !== alert.id);
          if (messages.size == 0) processing = false;
          else await channel.bulkDelete(messages).catch(() => {
            processing = false;
            fail = true;
          })
        }

        await channel.updateOverwrite(guild.roles.everyone, { SEND_MESSAGES: oldPermission })
        if (fail) alert.edit(`❌ Something went wrong when making the channel ready for counting. Do I have permissions? (Manage Channels)`);
        else alert.edit(`🔰 The channel is ready! Happy counting!`).then(m => m.delete(15000))
      }
    }
  } catch(e) {}

  return disabledGuilds.delete(guild.id);
}