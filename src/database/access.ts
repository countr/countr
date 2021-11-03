import Access from "./models/Access";

export const find = (guildId: string): Promise<boolean> => Access.findOne({ servers: guildId, expires: { $gte: new Date() }}).then(Boolean); // return boolean if it exists
export const findMultiple = (guildIds: Array<string>): Promise<Array<string>> => Access.find({ servers: { $in: guildIds }, expires: { $gte: new Date() }}).then(accesses => guildIds.filter(guildId => accesses.find(access => Boolean(access.servers.includes(guildId)))));
