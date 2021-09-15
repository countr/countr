import mongoose from "mongoose";

interface Access {
  user: string;
  servers: Array<string>;
  expires: Date;
}

const accessSchema = new mongoose.Schema<Access>({
  user: { type: String, required: true },
  servers: { type: [String], default: [] },
  expires: { type: Date, required: true },
});

const Access = mongoose.model<Access>("Access", accessSchema);

export const find = (guildId: string): Promise<boolean> => Access.findOne({ servers: guildId, expires: { $gte: new Date() } }).then(Boolean); // return boolean if it exists
export const findMultiple = (guildIds: Array<string>): Promise<Array<string>> => Access.find({ servers: { $in: guildIds }, expires: { $gte: new Date() } }).then(accesses => guildIds.filter(guildId => accesses.find(access => Boolean(access.servers.includes(guildId)))));