import limits from "../constants/limits";
import tlre from "time-limited-regular-expressions";

const regexTest = tlre({ limit: limits.filters.timeout }).match;

export default async (regex: string, text: string): Promise<boolean | null> => {
  try {
    const result = await regexTest(new RegExp(regex), text);
    return Boolean(result && result[0]);
  } catch (e) {
    return null;
  }
};
