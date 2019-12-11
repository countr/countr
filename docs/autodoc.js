const fs = require("fs")

fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  
  const content = {}, commands = []
  
  for (const file of files) if (file.endsWith(".js")) {
		let commandName = file.replace(".js", "")
		let commandFile = require("../commands/" + file)
		
		if (commandFile.permissionRequired < 4) { console.log(commandName, commandFile)
			if (!content[commandFile.permissionRequired.toString()]) content[commandFile.permissionRequired.toString()] = {}
			content[commandFile.permissionRequired.toString()][commandName] = commandFile.description
			
			commands.push([
				"## c!" + commandName,
				fixAngleBrackets(commandFile.description),
				"**Usage:** `c!" + commandName + Object.keys(commandFile.usage).map(arg => " " + arg).join("") + "`",
				"**Argument" + (Object.keys(commandFile.usage).length == 1 ? "" : "s") + ":** " + (Object.keys(commandFile.usage).map(arg => "\n- \`" + arg + "\`: " + fixAngleBrackets(commandFile.usage[arg])).join("") || "None."),
				"**Example" + (Object.keys(commandFile.examples).length == 1 ? "" : "s") + ":** " + (Object.keys(commandFile.examples).map(ex => "\n- \`c!" + commandName + " " + ex + "\`: " + fixAngleBrackets(commandFile.examples[ex])).join("") || "None."),
				"**Alias" + (commandFile.aliases.length == 1 ? "" : "es") + ":** " + (commandFile.aliases.map(alias => "\`c!" + alias + "\`").join(", ") || "None."),
			].filter(s => !s.endsWith(" None.")).join("\n\n"))
		}
  }
  
  let commandDoc = ""
  for (const permission in content) {
		commandDoc = commandDoc + "# Level " + permission + ": " + {"0": "Everyone\nEveryone get access to these commands.", "1": "Moderator\nEveryone with the `MANAGE_MESSAGES`-permission get access to these commands.", "2": "Admin\nEveryone with the `MANAGE_SERVER`-permission get access to these commands.", "3": "Owner\nOnly the owner of the server can access these commands."}[permission] + "\n"
		for (const command in content[permission]) {
			commandDoc = commandDoc + "- [c!" + command + "](#c" + command + "): " + content[permission][command] + "\n"
		}
		commandDoc = commandDoc + "\n"
  }
  
	commandDoc = commandDoc + commands.join("\n\n")
  
	fs.writeFileSync("./docs/commands.md", commandDoc, "utf8")
  
  process.exit(0)
})

function fixAngleBrackets(str) {
	while (str.includes("<") || str.includes(">")) str = str.replace("<", "&lt;").replace(">", "&gt;");
	// while (str.includes("bracketleftplease") || str.includes("bracketrightplease")) str = str.replace("bracketleftplease", "\\\\<").replace("bracketrightplease", "\\>");
	return str;
}