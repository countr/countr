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
  // "# Understanding Usage\n\nFor this explanation, we will use this command: `c!command <abc> [def] [<ghi>] jkl <mno: pq|rs> <tuv ...>`\n- [<abc>] is an optional argument. Leave it be or put in a value representing <abc>.\n-"
  let commandDoc = [
		"# Understanding Usage",
		"",
		"- Everything in angle brackets are user input, for example `<count>`.",
		"- Everything in square brackets are optional, for example `[repost]` or `[<search query>]`.",
		"- Everything without any brackets are required in the command for it to work, for example `all`",
		"- Sometimes you need to choose between multiple inputs, for example in `<mode: each|every|score>` or `all|<members...>`.",
		"- Sometimes an argument supports multiple inputs, for example in `<regex ...>`",
		"- Sometimes a combination of these are used.",
		"",
		"For example, in this command: `c!command <abc> [def] [<ghi>] jkl <mno: pq|rs> <tuv ...>`:",
		"- `<abc>` is required user input.",
		"- `[def]` is optional, but is not user input.",
		"- `[<ghi>]` is optional user input.",
		"- `jkl` is required, but is not user input.",
		"- `<mno: pq|rs>` is required user input, but can only choose between `pq` and `rs`.",
		"- `<tuv ...>` is required user input, but also supports multiple inputs.",
		"",
		"Still doesn't understand? Don't worry, most of the advanced commands have an example you can go out from.\n\n"
	].join("\n")
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
	return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}