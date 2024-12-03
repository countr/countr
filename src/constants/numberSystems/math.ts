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

function evalMath(input: string): number | null {
  try {
    return evaluate(input);
  } catch (err) {
    return null;
  }
}
