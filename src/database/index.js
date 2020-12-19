const config = require("../../config.json"), mongoose = require("mongoose");
mongoose.connect(config.database_uri, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
});

module.exports = (client) => ({
  guild: require("./guild.js")(client), // guild(guildid)
  cacheGuilds: require("./guild.js").cacheAll,
  global: require("./global.js")
});