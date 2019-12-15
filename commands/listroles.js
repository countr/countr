module.exports = {
  description: "Get a list of role rewards in the server.",
  usage: {},
  examples: {},
  aliases: [ "roles", "rolerewards", "roleslist" ],
  permissionRequired: 1, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
}

module.exports.run = async function(client, message, args, config, gdb, prefix, permissionLevel, db) {
  let { roles } = await gdb.get(), rolesList = formatRoles(roles);

  if (!rolesList.length) return message.channel.send("❌ No rolerewards for this server has been set up.")

  message.channel.send("📋 Rolerewards for this server:\n" + rolesList.join("\n"))
}

function formatRoles(roles) {
  let rolesList = []

  for (var id in roles) {
    let role = roles[id], mode;
    if (role.mode == "each") mode = "Every " + formatNumberSuffix(role.count) + " count"
    if (role.mode == "only") mode = "Count number " + role.count
    if (role.mode == "score") mode = "Score of " + role.count

    let gRole = guild.roles.get(role.role);
    if (gRole) rolesList.push("- \`" + id + "\` " + mode + " gives role " + gRole.name + (role.duration == "permanent" ? " permanently" : ""))
  }

  return rolesList;
}

function formatNumberSuffix(number) {
  let str = number.toString()

  if (str == 1) return ""; // instead of "Every 1st count", we say "Every count"

  if (str.endsWith("11") || str.endsWith("12") || str.endsWith("13")) return str + "th " // ex. eleventh instead of elevenst

  if (str.endsWith("1")) return str + "st "; // ends on first
  if (str.endsWith("2")) return str + "nd "; // ends on second
  if (str.endsWith("3")) return str + "rd "; // ends on third
  return str + "th " // ends on fourth, fifth, sixth etc.
}