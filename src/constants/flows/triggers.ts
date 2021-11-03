import { Trigger } from "../../types/flows/triggers";
import match from "../../utils/regex";
import { propertyTypes } from "./properties";

const triggers: Record<string, Trigger> = {
  each: {
    short: "Each X number",
    long: "This will get triggered whenever a user counts a multiple of X. For example, if X is 10, this will trigger on 10, 20, 30 etc.",
    properties: [propertyTypes.numberX],
    explanation: ([number]: [ number ]) => `When someone counts a multiplication of ${number}, for example ${number}, ${number * 2}, ${number * 3} and so on`,
    check: ({ count }, [number]: [ number ]) => Promise.resolve(count % number === 0),
  },
  only: {
    short: "Only number X",
    long: "This will get triggered whenever a user counts the number X, and only the number X.",
    properties: [propertyTypes.numberX],
    explanation: ([number]: [ number ]) => `When someone counts the number ${number}`,
    check: ({ count }, [number]: [ number ]) => Promise.resolve(count === number),
  },
  score: {
    short: "Score of X",
    long: "This will get triggered whenever a user has counted a total of X counts.",
    properties: [propertyTypes.numberX],
    explanation: ([number]: [ number ]) => `When someone counts a total of ${number} counts`,
    check: ({ score }, [number]: [ number ]) => Promise.resolve(score === number),
  },
  regex: {
    short: "Regex match",
    long: "This will get triggered when a successful count message matches a regex.",
    properties: [propertyTypes.regex],
    explanation: ([regex]: [ string ]) => `When a successful counting message matches the regex \`${regex}\``,
    check: async ({ message }, [regex]: [ string ]) => Boolean(await match(regex, message.content)),
  },
  countfail: {
    short: "Count fail",
    long: "This will get triggered whenever someone fails a count",
    properties: [],
    explanation: () => "When someone fails to count the correct number",
    check: () => Promise.resolve(false), // custom trigger
    limit: 1,
  },
  timeout: {
    short: "Timeout role triggered",
    long: "This will get triggered whenever someone gets the timeout role.",
    explanation: () => "When someone gets the timeout role",
    check: () => Promise.resolve(false), // custom trigger
    limit: 1,
  },
};

export default triggers;
