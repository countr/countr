import type { PresenceData } from "discord.js";
import { ActivityType } from "discord.js";
import { getWeeklyCount } from "./weeklyCount";

export default function getPresence(): PresenceData {
  return {
    status: "online",
    activities: [
      {
        type: ActivityType.Watching,
        name: `the counting channel • ${getWeeklyCount().toLocaleString("en-US")} global counts this week!`,
      },
    ],
  };
}
