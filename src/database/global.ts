import { Global } from "./models/Global";
import type { GlobalDocument } from "./models/Global";

export async function getGlobalDocument(): Promise<GlobalDocument> {
  return await Global.findOne() ?? new Global();
}
