export function bytesToHumanReadable(bytes: number): string {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Number((bytes / 1024 ** i).toFixed(2))} ${["B", "kB", "MB", "GB", "TB"][i] ?? ".."}`;
}
