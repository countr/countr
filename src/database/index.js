const config = require("../../config.json"), mongoose = require("mongoose");
mongoose.connect(config.database_uri, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = (client) => ({
  guild: require("./guild.js")(client, dbCache), // guild(guildid)
  global: require("./global.js")
})