import evaluate from "@emmetio/math-expression";
import type { NumberSystem } from ".";

const math: NumberSystem = {
  name: "Math Expressions (4*4 = 16)",
  convert: input => {
    const converted = evalMath(input);
    if (converted === null || isNaN(converted)) return null;
    return converted;
  },
  format: number => number.toString(),
};

export default math;

function evalMath(input: string): null | number {
  try {
    return evaluate(input);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return null;
  }
}
