import type { Snowflake } from "discord.js";
import ordinal from "ordinal";

export function createLeaderboard(scores: Array<[Snowflake, number]>, highlightUserId?: Snowflake): string {
  const sortedScores = scores.sort((a, b) => b[1] - a[1]);
  const top25 = sortedScores.slice(0, 25);

  return top25.map(([userId, score], index) => formatScore(userId, score, index, highlightUserId)).join("\n");
}

const medals: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

function formatScore(userId: Snowflake, score: number, index: number, highlightUserId?: Snowflake): string {
  const prefix = medals[index + 1] ?? `**${ordinal(index + 1)}**`;
  const line = `<@${userId}>, **score:** ${score.toLocaleString("en-US")}`;

  if (highlightUserId === userId) return `${prefix} *__${line}__*`;
  return `${prefix} ${line}`;
}
