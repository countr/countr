<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://socialify.git.ci/countr/countr/image?description=1&font=Inter&forks=1&language=1&name=1&owner=1&pattern=Plus&stargazers=1&theme=Dark">
  <img alt="Countr - Advanced Discord counting bot" src="https://socialify.git.ci/countr/countr/image?description=1&font=Inter&forks=1&language=1&name=1&owner=1&pattern=Plus&stargazers=1&theme=Light">
</picture>

# Explanation

Countr is an advanced Discord counting bot that can manage counting channels in your server. With a simple setup, your counting channel is ready to go. The bot provides smart counting system with customizable rules, statistics tracking, anti-cheat protection, and extensive configuration options.

Read more about Countr on our [website](https://countr.xyz)

# Self-hosting with Docker

<details>
<summary>Environment Configuration</summary>

Copy the `example.env` to `.env` and fill in the values. Below is a table with a description for each environment variable. We've excluded some variables that are not needed for private use.

| Variable | Description | Required | Example |
|:---------|:------------|:---------|:--------|
| `BOT_TOKEN` | The token of the bot | Yes | `NzI4NDkyNzYyNDg0MDQ...` |
| `API_PORT` | The port of the API | Yes | `9123` |
| `BOT_ID` | The ID of the bot | Recommended | `123456789012345678` |
| `OWNER` | The ID of the owner | Recommended | `123456789012345678` |
| `GUILD` | The ID of your main guild | Recommended | `123456789012345678` |
| `ADMINS` | The IDs of the admins separated with a comma | No | `id1,id2,id3` |
| `IS_PREMIUM` | Whether the bot is premium or not | No | `true` or `false` |

### Quick Start with Docker

Once you're done filling the values, you can start the bot using Docker:

```bash
# Start the bot in the background
npm run docker:up

# View logs
npm run docker:logs

# Stop the bot
npm run docker:down
```

Logs will also be available in the `logs` directory.

</details>

# Local Development

<details>
<summary>Local Development Setup</summary>

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- MongoDB instance
- Discord bot application

### Development Environment Variables

For local development, you'll need additional environment variables. See all available options in [`src/config.ts`](src/config.ts).

| Variable | Description | Required | Example |
|:---------|:------------|:---------|:--------|
| `BOT_TOKEN` | The token of the bot | Yes | `NzI4NDkyNzYyNDg0MDQ...` |
| `DATABASE_URI` | The URI of the mongo instance | Yes | `mongodb://localhost:27000/countr` |
| `BOT_ID` | The ID of the bot | Recommended | `123456789012345678` |
| `OWNER` | The ID of the owner | Recommended | `123456789012345678` |
| `GUILD` | The ID of your main guild | Recommended | `123456789012345678` |
| `ADMINS` | The IDs of the admins separated with a comma | No | `id1,id2,id3` |
| `API_PORT` | The port of the API | No | `9123` |
| `IS_PREMIUM` | Whether the bot is premium or not | No | `true` or `false` |

### MongoDB Setup

Set up a temporary MongoDB instance using Docker:

```bash
# Start a temporary mongo instance (data won't persist when stopped)
docker run --name countr-dev-db -d -p 27000:27017 mongo:4

# Start/stop the instance
docker start countr-dev-db
docker stop countr-dev-db
```

Your `DATABASE_URI` will be `mongodb://localhost:27000/countr`.

### Development Workflow

You'll need three terminals open for development:

**Terminal 1** - TypeScript Compiler
```bash
npm run watch
```
*Compiles TypeScript to JavaScript and watches for changes*

**Terminal 2** - Manager Process  
```bash
npm run start:manager
```
*Starts the cluster manager (restart manually when needed)*

**Terminal 3** - Bot Process
```bash
nodemon -d 0.1 --watch build
```
*Starts the bot and auto-restarts on changes to the build folder*

### Code Quality

Before submitting your code, ensure it passes linting:

```bash
# Fix auto-fixable issues and show remaining problems
npm run lint:fix

# Run all tests
npm test
```

</details>

# Contributing

We welcome contributions from the community! Here's how you can help:

## Bug Reports & Feature Requests

Have a bug to report or a feature idea? We'd love to hear from you! Please take your time on [opening a new issue](https://github.com/countr/countr/issues/new).

## Code Contributions

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

**Please ensure your code:**
- Follows our ESLint configuration
- Includes appropriate tests
- Is well-documented

## Community & Support

- **Discord Server**: [Join our community](https://promise.solutions/discord)
- **Website**: [countr.xyz](https://countr.xyz)
- **Issues**: Use GitHub Issues for bug reports and feature requests

> **Note**: The issue tracker is only for bug reports and enhancement suggestions. For questions, please ask in our Discord server.

## Contributors

You can see all contributors and their GitHub-profiles [here](https://github.com/countr/countr/graphs/contributors).

# License

This project is licensed under the **GNU General Public License v3.0**.

> **TL;DR**: You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.

**Important Notes:**
- Read the full [license text](LICENSE) if you plan on using the source code
- We are not obligated to provide support for self-hosted instances
- We do not recommend self-hosting for production use
