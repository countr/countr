[![DeepScan grade](https://deepscan.io/api/teams/5752/projects/13580/branches/231936/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5752&pid=13580&bid=231936)
[![Dependency Status](https://david-dm.org/countr/countr.svg)](https://david-dm.org/countr/countr)
[![GitHub Issues](https://img.shields.io/github/issues-raw/countr/countr.svg)](https://github.com/countr/countr/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr-raw/countr/countr.svg)](https://github.com/countr/countr/pulls)
[![License](https://img.shields.io/github/license/countr/countr.svg)](https://github.com/countr/countr/blob/master/LICENSE)
[![Discord Support](https://img.shields.io/discord/449576301997588490.svg)](https://promise.solutions/support)

# Countr

Countr is an advanced counting bot which can manage a counting channel in your guild. With a simple setup, your channel is ready.

## Suggestions, bugs, feature requests

Want to contribute? Great, we love that! Please take your time on [opening a new issue](https://github.com/countr/countr/issues/new).

## Contributors

You can see all contributors and their GitHub-profiles [here](https://github.com/countr/countr/graphs/contributors).

## Self-hosting
We do not recommend self-hosting the bot, but it's always an option. To selfhost the bot yourself, you need to have:
* Node - confirmed working on v12.16.1
* npm - comes with Node, the version shouldn't really matter
* A Discord bot token, and having the bot in your server
* An mongodb.com-database set up, as well as a user to it (with write access)
* A clone of the source code, this can be found [here](https://github.com/countr/countr) and needs to be extracted to a folder.

We will have to do this once:
* Rename `config.example.json` to `config.json`, and fill in the [values](#configuration).
* Do `npm i` inside the folder, and wait for it to finish.

After all this, start the bot with `npm run start`.

> ### ⚠ Warning 
> There is literally no warranty if you self-host Countr, and we will not help you set it up either. If you wish to set the bot up yourself, we expect you have well enough knowledge in Node.js. We still recommend using the original bot.

## Configuration

| Property       | Default    | Description |
|:---------------|:-----------|:------------|
| `token`        |            | The Discord bot token | 
| `database_uri` |            | The mongodb.com-user and password-URI. | N/A |
| `admins`       | `[]`       | An array of admins, the first one being the owner. | 
| `prefix`       | `"c!"`     | The prefix you want the bot to use for commands. |
| `mainGuild`    |            | The main guild the bot will be in. |
| `color`        | `12404274` | The brand color in decimal number. |
| `webhookUrl`   | `null`     | A webhook URL to post to at the end of every week. Response is `{ "value1": *counts this week*, "value2": *week number* }`. Maybe hook it up to a Twitter handle via IFTTT? |

## License

We use the GNU GPLv3-license.

> You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.

Fetched from [TLDRLegal](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)), please also read the [license](https://github.com/countr/countr/blob/master/LICENSE) if you plan on using the source code. This is only a short summary. Please also take note of that we are not forced to help you, and we won't help you host it yourself as we do not recommend you doing so.
