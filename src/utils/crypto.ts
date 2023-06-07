// eslint-disable-next-line import/prefer-default-export -- this is an util file, there shouldn't be a default export
export function generateId(length = 6): string {
  // return random hex string
  const string = (Math.random() + 1).toString(16).substring(2, length + 2);
  return string.padEnd(length, "0");
}
