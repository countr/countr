export function generateId(length = 6): string {
  // return random hex string
  const string = (Math.random() + 1).toString(16).substring(2, length);
  return string.padEnd(length, "0");
}
