import type { CountingChannelSchema } from "../../database/models/Guild";
import { matchRegex } from "../../utils/regex";

export default async function checkRegex(content: string, filters: CountingChannelSchema["filters"]): Promise<boolean> {
  // sort the filters by smallest to largest (assume this is complexity) and check if any of them match
  for (const filter of filters.sort((a, b) => a.length - b.length)) if (await matchRegex(filter, content)) return true;
  return false;
}
