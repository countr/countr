export function generateId(length = 6): string {
  // return random hex string
  const string = (Math.random() + 1).toString(16).substr(2, length);
  return string + "0".repeat(length - string.length); // fill in extra zeros if the length is too short
}