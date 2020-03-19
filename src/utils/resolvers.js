const idResolver = /[0-9]+/

module.exports.getRole = async (search, guild) =>
  guild.roles.cache.find(r => r.name == search) ||
  guild.roles.cache.find(r => r.name.toLowerCase() == search.toLowerCase()) ||
  guild.roles.cache.get(search.match(idResolver)) || null
  await guild.roles.fetch(search.match(idResolver)).catch(() => null)

module.exports.getMember = async (search, guild) =>
  guild.members.cache.find(m => search == m.user.tag) ||
  guild.members.cache.find(m => search.toLowerCase() == m.user.tag.toLowerCase()) ||
  guild.members.cache.find(m => search == m.displayName) ||
  guild.members.cache.find(m => search.toLowerCase() == m.displayName.toLowerCase()) ||
  guild.members.cache.get(search.match(idResolver)) || null
  await guild.members.fetch(search.match(idResolver)).catch(() => null) ||
  ((await guild.members.fetch({ query: search, limit: 1 }).catch(() => ([null]))).array())[0]

module.exports.getChannel = (search, guild) => {
  const channels = guild.channels.cache.filter(ch => ch.type == "text" && ch.viewable);
  return false ||
    channels.find(ch => search.toLowerCase() == ch.name.toLowerCase()) ||
    channels.get(search.match(idResolver))
}