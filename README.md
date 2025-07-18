<div align="center">

# 🔢 Countr

**The most advanced Discord counting bot**

*Transform your server with engaging counting channels that keep your community active and competitive*

[![Website](https://img.shields.io/badge/🌐-Website-5865F2?style=for-the-badge)](https://countr.xyz)
[![Discord](https://img.shields.io/badge/💬-Discord-5865F2?style=for-the-badge)](https://promise.solutions/discord)

---

**Build Status** • **Code Quality**

[![Docker test](https://img.shields.io/github/actions/workflow/status/countr/countr/docker-compose-test.yml?label=Docker&style=flat-square)](https://github.com/countr/countr/actions/workflows/docker-compose-test.yml)
[![Testing](https://img.shields.io/github/actions/workflow/status/countr/countr/testing.yml?label=Tests&style=flat-square)](https://github.com/countr/countr/actions/workflows/testing.yml)
[![Linting](https://img.shields.io/github/actions/workflow/status/countr/countr/linting.yml?label=Quality&style=flat-square)](https://github.com/countr/countr/actions/workflows/linting.yml)
[![DeepScan grade](https://deepscan.io/api/teams/16173/projects/19382/branches/641642/badge/grade.svg?style=flat-square)](https://deepscan.io/dashboard#view=project&tid=16173&pid=19382&bid=641642)

**Project Stats** • **Community**

[![discord.js](https://img.shields.io/github/package-json/dependency-version/countr/countr/discord.js?style=flat-square&logo=discord&logoColor=white)](https://www.npmjs.com/package/discord.js)
[![GitHub Issues](https://img.shields.io/github/issues-raw/countr/countr.svg?style=flat-square)](https://github.com/countr/countr/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr-raw/countr/countr.svg?style=flat-square)](https://github.com/countr/countr/pulls)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏠 Self-Hosting](#-self-hosting)
- [💻 Development](#-development)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

🎯 **Smart Counting System** - Advanced counting channel management with customizable rules and validation

🔧 **Flexible Configuration** - Extensive customization options for counting behavior and channel settings

📊 **Statistics & Leaderboards** - Track counting stats and maintain competitive leaderboards

🛡️ **Anti-Cheat Protection** - Built-in protection against cheating and spam

🔌 **Easy Setup** - Simple bot configuration with minimal setup required

💎 **Premium Features** - Enhanced functionality for premium users

---

## 🚀 Quick Start

Ready to add Countr to your Discord server? Visit our [website](https://countr.xyz) to get started with the public instance, or follow the self-hosting guide below for your own private installation.

---

## 🛠️ Technology Stack

Countr is built with modern, reliable technologies:

- **🤖 [Discord.js v14](https://discord.js.org/)** - Advanced Discord API wrapper
- **📘 [TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development  
- **🍃 [MongoDB](https://www.mongodb.com/)** - NoSQL database with Mongoose ODM
- **🚀 [Express.js](https://expressjs.com/)** - Web framework for API endpoints
- **🐳 [Docker](https://www.docker.com/)** - Containerized deployment
- **📋 [ESLint](https://eslint.org/)** - Code quality and consistency
- **🧪 [Jest](https://jestjs.io/)** - Comprehensive testing framework

---

## 🏠 Self-Hosting

<details>
<summary><strong>📋 Prerequisites & Setup Instructions</strong></summary>

### Environment Configuration

Copy the `example.env` to `.env` and fill in the values. Below is a table with a description for each environment variable. We've excluded some variables that are not needed for private use.

| Variable | Description | Required | Example |
|:---------|:------------|:---------|:--------|
| `BOT_TOKEN` | The token of the bot | ✅ Yes | `NzI4NDkyNzYyNDg0MDQ...` |
| `API_PORT` | The port of the API | ✅ Yes | `9123` |
| `BOT_ID` | The ID of the bot | 🔶 Recommended | `123456789012345678` |
| `OWNER` | The ID of the owner | 🔶 Recommended | `123456789012345678` |
| `GUILD` | The ID of your main guild | 🔶 Recommended | `123456789012345678` |
| `ADMINS` | The IDs of the admins separated with a comma | ❌ No | `id1,id2,id3` |
| `IS_PREMIUM` | Whether the bot is premium or not | ❌ No | `true` or `false` |

### 🚀 Quick Start with Docker

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

---

## 💻 Development

<details>
<summary><strong>🛠️ Local Development Setup</strong></summary>

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- MongoDB instance
- Discord bot application

### Development Environment Variables

For local development, you'll need additional environment variables. See all available options in [`src/config.ts`](src/config.ts).

| Variable | Description | Required | Example |
|:---------|:------------|:---------|:--------|
| `BOT_TOKEN` | The token of the bot | ✅ Yes | `NzI4NDkyNzYyNDg0MDQ...` |
| `DATABASE_URI` | The URI of the mongo instance | ✅ Yes | `mongodb://localhost:27000/countr` |
| `BOT_ID` | The ID of the bot | 🔶 Recommended | `123456789012345678` |
| `OWNER` | The ID of the owner | 🔶 Recommended | `123456789012345678` |
| `GUILD` | The ID of your main guild | 🔶 Recommended | `123456789012345678` |
| `ADMINS` | The IDs of the admins separated with a comma | ❌ No | `id1,id2,id3` |
| `API_PORT` | The port of the API | ❌ No | `9123` |
| `IS_PREMIUM` | Whether the bot is premium or not | ❌ No | `true` or `false` |

### 🗄️ MongoDB Setup

Set up a temporary MongoDB instance using Docker:

```bash
# Start a temporary mongo instance (data won't persist when stopped)
docker run --name countr-dev-db -d -p 27000:27017 mongo:4

# Start/stop the instance
docker start countr-dev-db
docker stop countr-dev-db
```

Your `DATABASE_URI` will be `mongodb://localhost:27000/countr`.

### 🚀 Development Workflow

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

### ✅ Code Quality

Before submitting your code, ensure it passes linting:

```bash
# Fix auto-fixable issues and show remaining problems
npm run lint:fix

# Run all tests
npm test
```

</details>

### 🧑‍💻 GitHub Codespaces

<details>
<summary><strong>☁️ Cloud Development Environment</strong></summary>

For GitHub Pro users or those with access to [GitHub Codespaces](https://github.com/codespaces), you can develop Countr in the cloud.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=171858090)

**What's included:**
- ✅ Pre-configured development environment  
- ✅ MongoDB database ready to use
- ✅ All development tools installed
- ✅ Pre-configured `.env` file (just add your bot token)

You'll still need to set up the three terminals mentioned in the local development section.

</details>

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports & Feature Requests

Have a bug to report or a feature idea? We'd love to hear from you!

[![Open an Issue](https://img.shields.io/badge/📝-Open%20an%20Issue-blue?style=for-the-badge)](https://github.com/countr/countr/issues/new)

### 💻 Code Contributions

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

**Please ensure your code:**
- ✅ Follows our ESLint configuration
- ✅ Includes appropriate tests
- ✅ Is well-documented

### 👥 Community & Support

- 💬 **Discord Server**: [Join our community](https://promise.solutions/discord)
- 🌐 **Website**: [countr.xyz](https://countr.xyz)
- 📧 **Issues**: Use GitHub Issues for bug reports and feature requests

> **Note**: The issue tracker is only for bug reports and enhancement suggestions. For questions, please ask in our Discord server.

### 🏆 Contributors

A huge thanks to all our contributors! You can see everyone who has contributed [here](https://github.com/countr/countr/graphs/contributors).

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0**.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

> **TL;DR**: You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.

**Important Notes:**
- 📖 Read the full [license text](LICENSE) if you plan on using the source code
- 🚫 We are not obligated to provide support for self-hosted instances
- ⚠️ We do not recommend self-hosting for production use

---

<div align="center">

**Made with ❤️ by the Countr team**

[Website](https://countr.xyz) • [Discord](https://promise.solutions/discord) • [GitHub](https://github.com/countr/countr)

</div>
