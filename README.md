[![Docker test](https://img.shields.io/github/workflow/status/countr/countr/Docker%20Compose)](https://github.com/countr/countr/actions/workflows/docker-test.yml)
[![Linting](https://img.shields.io/github/workflow/status/countr/countr/Linting?label=quality)](https://github.com/countr/countr/actions/workflows/linting.yml)
[![Analysis and Scans](https://img.shields.io/github/workflow/status/countr/countr/Analysis%20and%20Scans?label=scan)](https://github.com/countr/countr/actions/workflows/analysis-and-scans.yml)
[![Testing](https://img.shields.io/github/workflow/status/countr/countr/Testing?label=test)](https://github.com/countr/countr/actions/workflows/testing.yml)
[![DeepScan grade](https://deepscan.io/api/teams/16173/projects/19382/branches/621619/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16173&pid=19382&bid=621619)
[![discord.js version](https://img.shields.io/github/package-json/dependency-version/countr/countr/discord.js)](https://www.npmjs.com/package/discord.js)
[![GitHub Issues](https://img.shields.io/github/issues-raw/countr/countr.svg)](https://github.com/countr/countr/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr-raw/countr/countr.svg)](https://github.com/countr/countr/pulls)

# Countr

Countr is an advanced counting bot which can manage a counting channel in your guild. With a simple setup, your channel is ready.

Read more about Countr on our [website](https://countr.xyz)

## Setup for private use

Copy the `example.env` to `.env` and fill in the values. Below is a table with a description for each environment variable. We've excluded some variables that are not needed for private use.

| Variable     | Description                                                | Required    |
|:-------------|:-----------------------------------------------------------|:------------|
| `BOT_TOKEN`  | The token of the bot                                       | Yes         |
| `API_PORT`   | The port of the API (just put it to something like `9123`) | Yes         |
| `BOT_ID`     | The ID of the bot                                          | Recommended |
| `OWNER`      | The ID of the owner                                        | Recommended |
| `GUILD`      | The ID of your main guild                                  | Recommended |
| `ADMINS`     | The IDs of the admins separated with a comma               | No          |
| `IS_PREMIUM` | Whether the bot is premium or not (`true`/`false`)         | No          |

Once you're done filling the values, you can do `npm run docker:up`. You can stop it using `npm run docker:down` and view logs using `npm run docker:logs` or by going to the `logs` directory.

## Local development

You can set it up however you'd like, however we like to use[`nodemon`](https://nodemon.io/) to automatically restart our bot when changes are made. Doing local development in our way is a little complicated as you need three terminals open, as well as a mongo instance, but it should be fine.

You can set up a temporary mongo instance using Docker: `docker run --name countr-dev-db -d mongo:4 --ports 27000:27000` - keep in mind this won't store your data when you stop the container. You can start and stop this instance with `docker start/stop countr-dev-db`. Your`DATABASE_URI` will be `mongodb://localhost:27000/countr`.

You still need your envoironment variables set up and stuff though, however there are different environment variables for local development. There's more advanced environment variables than the ones listed below, you can see them all in the [`src/config.ts`](src/config.ts) file.

| Variable       | Description                                                | Required    |
|:---------------|:-----------------------------------------------------------|:------------|
| `BOT_TOKEN`    | The token of the bot                                       | Yes         |
| `DATABASE_URI` | The URI of the mongo instance                              | Yes         |
| `BOT_ID`       | The ID of the bot                                          | Recommended |
| `OWNER`        | The ID of the owner                                        | Recommended |
| `GUILD`        | The ID of your main guild                                  | Recommended |
| `ADMINS`       | The IDs of the admins separated with a comma               | No          |
| `API_PORT`     | The port of the API                                        | No          |
| `IS_PREMIUM`   | Whether the bot is premium or not (`true`/`false`)         | No          |

- Terminal 1: `npm run watch`
  - This will compile our TypeScript to JavaScript and will put it in the `build` folder.
- Terminal 2: `npm run start:manager`
  - This will start the manager. We don't use nodemon for this as we rarely edit the manager's code anyways. It will also bug out if we use nodemon on both instances.
- Terminal 3: `nodemon -d 0.1 --watch build`
  - This will start the bot, and will watch for any changes in the `build` folder.

Once your code is finished, make sure it's all linted. You can run `npm run lint:fix` to see any non-autofixable linting errors.

## Suggestions, bugs, feature requests

Want to contribute? Great, we love that! Please take your time on [opening a new issue](https://github.com/countr/countr/issues/new).

## Contributors

You can see all contributors and their GitHub-profiles [here](https://github.com/countr/countr/graphs/contributors).

## License

We use the GNU GPLv3-license.

> You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.

Fetched from [TLDRLegal](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)), please also read the [license](https://github.com/countr/countr/blob/master/LICENSE) if you plan on using the source code. This is only a short summary. Please also take note of that we are not forced to help you, and we won't help you host it yourself as we do not recommend you doing so.
