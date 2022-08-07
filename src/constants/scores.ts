import type { Snowflake } from "discord.js";
import ordinal from "ordinal";

export function createLeaderboard(scores: Array<[Snowflake, number]>, highlightUserId?: Snowflake): string {
  const sortedScores = scores.sort((a, b) => b[1] - a[1]);
  const top25 = sortedScores.slice(0, 25);
  const userIds = top25.map(score => score[0]);

  let description = top25.map(([userId, score], index) => formatScore(userId, score, index, highlightUserId)).join("\n");
  
  if (highlightUserId && !userIds.includes(highlightUserId)) {
    if (top25.length) description += "\n^^^^^^^^^^^^^^^^^^^^^^^^^\n";
    description += formatScore(highlightUserId, scores[highlightUserId] ?? 0, sortedScores.indexOf(highlightUserId));
  }
  
  return description;
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
