const mongoose = require("mongoose"), { getWeek } = require("../utils/time");

const globalSchema = new mongoose.Schema({
  counts: { type: Number, default: 0 },
  week: { type: Number, default: getWeek }
});

const Global = mongoose.model("Global", globalSchema);

module.exports = {
  get: async () => (await Global.findOne()) || new Global()
};