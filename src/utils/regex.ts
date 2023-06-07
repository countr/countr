import tlre from "time-limited-regular-expressions";

const regexTest = tlre({ limit: 1 }).match;

// eslint-disable-next-line import/prefer-default-export -- this is an util file, there shouldn't be a default export
export async function matchRegex(regexString: string, text: string): Promise<boolean | null> {
  try {
    const result = await regexTest(new RegExp(regexString, "u"), text);
    return Boolean(result?.[0]);
  } catch (err) {
    return null;
  }
}
