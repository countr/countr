export const medals: Record<string, string> = {
  "1st": "🥇",
  "2nd": "🥈",
  "3rd": "🥉",
// "10th": "💩",
};

export const formatScore = (userId: string, score: number, index: number, highlightUserId?: string): string => {
  const suffix = formatNumberSuffix(index + 1);
  const medal = medals[suffix] || `**${suffix}**:`;

  const line = `<@${userId}>, **score:** ${score.toLocaleString("en-US")}`;

  if (highlightUserId === userId) return `${medal} *__${line}__*`;
  return `${medal} ${line}`;
};

function formatNumberSuffix(number: number): string {
  const str = number.toString();

  if (str === "0") return "N/A";
  if (str.endsWith("11") || str.endsWith("12") || str.endsWith("13")) return `${number}th`;
  if (str.endsWith("1")) return `${number}st`;
  if (str.endsWith("2")) return `${number}nd`;
  if (str.endsWith("3")) return `${number}rd`;
  return `${number}th`;
}
