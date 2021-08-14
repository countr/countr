const mongoose = require("mongoose");

const accessSchema = new mongoose.Schema({
  user: { type: String, required: true },
  servers: { type: [String], default: [] },
  expires: { type: Date, required: true },
});

const Access = mongoose.model("Access", accessSchema);

module.exports = {
  find: guildId => Access.findOne({ servers: guildId, expires: { $gte: Date.now() } }).then(Boolean), // return boolean if it exists
  findMultiple: guildIds => Access.find({ servers: { $in: guildIds }, expires: { $gte: Date.now() } }).then(accesses => guildIds.filter(guildId => accesses.find(access => Boolean(access.servers.includes(guildId))))),
};