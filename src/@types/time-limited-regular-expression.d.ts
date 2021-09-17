declare module "time-limited-regular-expressions" {
  interface Options {
    limit: number;
  }

  interface TimeLimitedRegularExpression {
    match(regExp: RegExp, string: string): Promise<RegExpMatchArray | null>
  }

  export default function(options?: Options): TimeLimitedRegularExpression;
}