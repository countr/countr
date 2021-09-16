import { Guild, GuildChannel, GuildMember, Role, ThreadChannel } from "discord.js";

const idRegex = /[0-9]+/;

export async function getRole(search: string, guild: Guild): Promise<Role | null> {
  const id = (search.match(idRegex) || [ search ])[0];
  return false || // for multi-line only
    guild.roles.resolve(id) ||
    guild.roles.cache.find(r => r.name == search) ||
    guild.roles.cache.find(r => r.name.toLowerCase() == search.toLowerCase()) ||
    await guild.roles.fetch(id).catch(() => null) ||
    null;
}

export async function getMember(search: string, guild: Guild): Promise<GuildMember | null> {
  const id = (search.match(idRegex) || [ search ])[0];
  return false || // for multi-line only
    guild.members.resolve(id) ||
    guild.members.cache.find(m => m.user.tag.toLowerCase() == search.toLowerCase()) ||
    guild.members.cache.find(m => m.displayName == search) ||
    guild.members.cache.find(m => m.displayName.toLowerCase() == search.toLowerCase()) ||
    await guild.members.fetch(id).catch(() => null) ||
    await guild.members.fetch({ query: search, limit: 1 }).then(members => members.first()).catch(() => null) ||
    null;
}

export async function getChannel(search: string, guild: Guild): Promise<GuildChannel | ThreadChannel | null> {
  const id = (search.match(idRegex) || [ search ])[0];
  return false || // for multi-line only
    guild.channels.resolve(id) ||
    guild.channels.cache.find(c => c.name == search) ||
    guild.channels.cache.find(c => c.name.toLowerCase() == search.toLowerCase()) ||
    guild.channels.cache.find(c => c.id == id) ||
    guild.channels.cache.find(c => c.id.toLowerCase() == id.toLowerCase()) ||
    guild.channels.cache.find(c => c.type == search) ||
    guild.channels.cache.find(c => c.type.toLowerCase() == search.toLowerCase()) ||
    await guild.channels.fetch(id).catch(() => null) ||
    null;
}