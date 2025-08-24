import type { MentionCommand } from ".";
import config from "../../config";
import { docsUrl, homepage, supportServerUrl } from "../../constants/links";
import { DebugCommandLevel } from "../../constants/permissions";

const command: MentionCommand = {
  aliases: ["commands"],
  debugLevel: DebugCommandLevel.None,
  testArgs(args) { return args.length === 0; },
  async execute(_message, reply) {
    return reply({
      embeds: [
        {
          title: "📚 Countr Help",
          description: "Countr is an advanced counting bot that helps manage counting channels in your server. Here's how to get started:",
          fields: [
            {
              name: "🚀 Getting Started",
              value: [
                "• `/channels new` - Create a new counting channel",
                "• `/channels link` - Link an existing channel for counting",
                "• `/select` - Select a counting channel to work with",
              ].join("\n"),
              inline: false,
            },
            {
              name: "📊 Basic Commands",
              value: [
                "• `/about` - View bot information and statistics",
                "• `/ping` - Check bot response time",
                "• `/count` - View current count in selected channel",
                "• `/leaderboard` - View server counting leaderboard",
                "• `/user` - View user counting statistics",
              ].join("\n"),
              inline: true,
            },
            {
              name: "🔧 Admin Commands",
              value: [
                "• `/set` - Configure counting settings",
                "• `/filters` - Manage counting filters",
                "• `/flows` - Set up counting rewards/actions",
                "• `/modules` - Enable/disable bot features",
                "• `/scores` - Manage user scores",
              ].join("\n"),
              inline: true,
            },
            {
              name: "🔗 Useful Links",
              value: [
                `**Documentation**: [${docsUrl}](${docsUrl})`,
                `**Support Server**: [Join Here](${supportServerUrl})`,
                `**Website**: [${homepage}](${homepage})`,
              ].join("\n"),
              inline: false,
            },
            {
              name: "💡 Quick Tip",
              value: "New to Countr? Start with `/channels new` to create your first counting channel, then explore the settings with `/set` commands!",
              inline: false,
            },
          ],
          color: config.colors.primary,
          footer: {
            text: "Use /about for detailed bot information • Need more help? Join our support server!",
          },
        },
      ],
    });
  },
};

export default { ...command } as MentionCommand;
