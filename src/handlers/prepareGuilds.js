module.exports = async (guild, db) => {
  const gdb = await db.guild(guild.id), { timeouts, timeoutrole, modules, channel: channelid, message: messageid } = gdb.get();

  // recover module
  if (modules.includes("recover")) try {
    let channel = guild.channels.resolve(channelid);
    if (channel && channel.partial) channel = await channel.fetch();
    if (channel) {
      let messages = await channel.messages.fetch({ limit: 100, after: messageid });
      if (messages.size) {
        const
          alert = await channel.send("💢 Making channel ready for counting."),
          defaultPermissions = channel.permissionOverwrites.get(guild.roles.everyone) || { allow: new Set(), deny: new Set() };
        let oldPermission = null;
        if (defaultPermissions.allow.has("SEND_MESSAGES")) oldPermission = true;
        else if (defaultPermissions.deny.has("SEND_MESSAGES")) oldPermission = false;

        if (oldPermission !== false) await channel.updateOverwrite(guild.roles.everyone, { SEND_MESSAGES: false }, "Making channel ready for counting");

        let processing = true, fail = false;
        while (processing) {
          messages = messages.filter(m => m.id !== alert.id);
          if (messages.size == 0) processing = false;
          else {
            await channel.bulkDelete(messages).catch(() => {
              processing = false;
              fail = true;
            });
          }
          // check if we're gonna run it again
          if (processing) messages = await channel.messages.fetch({ limit: 100, after: messageid });
        }

        if (oldPermission !== false) await channel.updateOverwrite(guild.roles.everyone, { SEND_MESSAGES: oldPermission });
        if (fail) alert.edit("❌ Something went wrong when making the channel ready for counting. Do I have permissions? (Manage Channels)");
        else alert.edit("🔰 The channel is ready! Happy counting!") && setTimeout(() => alert.delete(), 5000);
      }
    }
  } catch(e) { /* something went wrong */ }

  // timeouts
  for (let userid in timeouts) try {
    let member = await guild.members.fetch(userid);
    if (member && member.roles.cache.get(timeoutrole.role)) {
      if (Date.now() >= timeouts[userid]) {
        member.roles.remove(timeoutrole.role, "User no longer timed out (offline)").catch();
        gdb.removeFromObject("timeouts", userid);
      } else setTimeout(() => {
        member.roles.remove(timeoutrole.role, "User no longer timed out").catch();
        gdb.removeFromObject("timeouts", userid);
      }, timeouts[userid] - Date.now());
    } else if (member && !member.roles.cache.get(timeoutrole.role)) gdb.removeFromObject("timeouts", userid);
  } catch(e) { /* something went wrong */ }
};