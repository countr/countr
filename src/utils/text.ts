export const trim = (string: string, length: number) => {
  if (string.length <= length) return string;
  else return string.substr(0, length - 3) + "...";
};