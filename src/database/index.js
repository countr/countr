const config = require("../../config.json"), mongoose = require("mongoose");

module.exports = (client) => {
  mongoose.connect(config.database_uri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  }).catch(e => {
    console.log(e);
    client.shard.send("respawn");
  });
  // Sometimes the connection to the database fails, so we instead try to restart the entire shard.

  return {
    guild: require("./guild.js")(client), // guild(guildid)
    cacheGuilds: require("./guild.js").cacheAll,
    global: require("./global.js")
  };
};