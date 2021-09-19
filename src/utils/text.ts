export const trim = (string: string, length: number): string => {
  if (string.length <= length) return string;
  else return string.substr(0, length - 3) + "...";
};

export const capitalizeFirst = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};