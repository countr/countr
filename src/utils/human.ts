// eslint-disable-next-line import/prefer-default-export -- this is an util file, there shouldn't be a default export
export function bytesToHumanReadable(bytes: number): string {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Number((bytes / 1024 ** i).toFixed(2))} ${["B", "kB", "MB", "GB", "TB"][i] ?? ".."}`;
}
