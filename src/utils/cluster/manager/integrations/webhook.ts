import config from "../../../../config";
import superagent from "superagent";

export default function (counts: number, week: number): void {
  if (config.integrations.webhook) void superagent.post(config.integrations.webhook).send({ value1: counts, value2: week });
}
