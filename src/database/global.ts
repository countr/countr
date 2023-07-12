import type { GlobalDocument } from "./models/Global";
import { Global } from "./models/Global";

// eslint-disable-next-line i/prefer-default-export -- it is exiected
export async function getGlobalDocument(): Promise<GlobalDocument> {
  return await Global.findOne() ?? new Global();
}
