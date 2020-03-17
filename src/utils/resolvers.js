const idResolver = /[0-9]+/

module.exports.role = (argument, { guild }) =>
  guild.roles.cache.find(r => r.name == argument) ||
  guild.roles.cache.find(r => r.name.toLowerCase() == argument.toLowerCase()) ||
  guild.roles.cache.get(argument.match(idResolver)) || null

module.exports.member = (argument, { guild }) =>
  guild.members.cache.find(m => argument == m.user.tag) ||
  guild.members.cache.find(m => argument.toLowerCase() == m.user.tag.toLowerCase()) ||
  guild.members.cache.find(m => argument == m.displayName) ||
  guild.members.cache.find(m => argument.toLowerCase() == m.displayName.toLowerCase()) ||
  guild.members.cache.get(argument.match(idResolver)) || null

module.exports.channel = (argument, { guild }) => {
  const channels = guild.channels.cache.filter(ch => ch.type == "text" && ch.viewable);
  return false ||
    channels.find(ch => argument.toLowerCase() == ch.name.toLowerCase()) ||
    channels.get(argument.match(idResolver))
}