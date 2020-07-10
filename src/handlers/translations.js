const config = require("../../config.json")

module.exports = (gdb, command = "", alias = "", usage = "") => {
  const { language = "en", prefix = config.prefix } = gdb.get();
  const strings = Object.assign(Object.assign({}, require("../translations/en.json")), require(`../translations/${language}.json`))
  for (const key in strings) strings[key] = strings[key]
    .replace(/{{PREFIX}}/gm, prefix)
    .replace(/{{COMMAND}}/gm, command)
    .replace(/{{ALIAS}}/gm, alias)
    .replace(/{{USAGE}}/gm, usage)
  return strings;
}