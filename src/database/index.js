const mongoose = require("mongoose"), config = require("../../config");

module.exports = {
  connection: mongoose.connect(config.database_uri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  }),

  guilds: require("./guilds"),
  global: require("./global"),
};