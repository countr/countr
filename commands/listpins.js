module.exports = {
  description: "Get a list of pintriggers.",
  usage: {},
  examples: {},
  aliases: [ "pinlist", "pins", "pintriggers" ],
  permissionRequired: 1, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let { pins } = await gdb.get(), pinsList = formatPins(pins);

  if (!pinsList.length) return message.channel.send("❌ No pintriggers for this server has been set up.")
  
  message.channel.send("📋 Pintriggers for this server:\n" + pinsList.join("\n"))
}

function formatPins(pins) {
  let pinsList = []

  for (var id in pins) {
    let pin = pins[id], mode;
    if (pin.mode == "each") mode = "Every " + formatNumberSuffix(pin.count) + "count"
    if (pin.mode == "only") mode = "Count number " + pin.count

    pinsList.push("- \`" + id + "\` " + mode + (pin.action == "repost" ? " reposts then " : " ") + "pins")
  }

  return pinsList;
}

function formatNumberSuffix(number) {
  let str = number.toString()

  if (str == "1") return ""; // instead of "Every 1st count", we say "Every count"

  if (str.endsWith("11") || str.endsWith("12") || str.endsWith("13")) return str + "th " // ex. eleventh instead of elevenst

  if (str.endsWith("1")) return str + "st "; // ends on first
  if (str.endsWith("2")) return str + "nd "; // ends on second
  if (str.endsWith("3")) return str + "rd "; // ends on third
  return str + "th " // ends on fourth, fifth, sixth etc.
}