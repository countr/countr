import type { Property } from ".";
import { shortInput } from "./inputs";

const regex: Property<string> = {
  name: "Regular expression",
  description: "Get help on how to create a regex here: todo add regex help link",
  schema: { type: "string" },
  input: shortInput("regular expression"),
  convert: userInput => {
    try {
      RegExp(userInput, "u");
      return userInput;
    } catch (err) {
      return null;
    }
  },
  format: expression => expression,
};

export default regex;
