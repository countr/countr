export const trail = "…";
export function fitText(string: string, length: number, includeTrail = true): string {
  if (string.length <= length) return string;
  if (includeTrail) return `${string.slice(0, length - trail.length).trimEnd()}${trail}`;
  return string.slice(0, length);
}

export function capitalizeFirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatListToHuman(list: string[]): string {
  // join list with ", " and add "and" before last item
  return list.slice(0, -1).join(", ") + (list.length > 1 ? `, and ${list[list.length - 1]!}` : "");
}

export function handlePlural(amount: number, name: string): string {
  return amount === 1 ? `${amount} ${name}` : `${amount} ${name}s`;
}
