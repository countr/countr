const { getPermissionLevel } = require("../constants");

const fails = new Map();

module.exports = async (message, gdb) => {
  if (message.partial && !message.member) message = await message.fetch();
  if (message.member.partial) message.member = await message.member.fetch(); 

  const permissionLevel = getPermissionLevel(message.member);

  if (message.content.startsWith("!") && permissionLevel >= 1) return;

  let { count, user, modules, regex } = gdb.get(), regexMatches = false;
  if (regex.length && permissionLevel == 0)
    for (let r of regex)
      if ((new RegExp(r, 'g')).test(message.content)) {
        regexMatches = true;
        break;
      }
  
  if (
    regexMatches ||
    (!modules.includes("allow-spam") && message.author.id == user) ||
    (!modules.includes("talking") && message.content !== (count + 1).toString()) ||
    message.content.split(" ")[0] !== (count + 1).toString()
  ) return message.delete();

  count++;
  gdb.addToCount(message.member);

  let countingMessage = message;
  if (modules.includes("webhook")) try {
    let webhooks = await message.channel.fetchWebhooks(), webhook = webhooks.find(wh => wh.name == "Countr");
    if (!webhook) webhook = await message.chanel.createWebhook("Countr").catch(() => null);

    if (webhook) {
      countingMessage = await webhook.send(message.content, {
        username: message.author.username,
        avatarURL: message.author.displayAvatarURL({ dynamic: true }),
      });
      message.delete();
    }
  } catch(e) {}
  else if (modules.includes("reposting")) try {
    countingMessage = await message.channel.send({
      embed: {
        description: `${message.author}: ${message.content}`,
        color: message.member.displayColor || 3553598
      }
    })
    message.delete();
  } catch(e) {}
  
  return gdb.afterCount(count, message.member, countingMessage)
}