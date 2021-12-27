import { CountingChannel, Flow } from "../../database/models/Guild";
import { CountingData } from "../../types/flows/countingData";
import actions from "../../constants/flows/actions";
import { countrLogger } from "../../utils/logger/countr";
import { inspect } from "util";
import limits from "../../constants/limits";
import triggers from "../../constants/flows/triggers";

export default async (data: CountingData) => {
  const { countingChannel } = data;
  const flowsToTest = getFlows(countingChannel);
  const flowsToRun = [];

  for (const flow of flowsToTest) {
    if (await testFlow(flow, data)) {
      flowsToRun.push(flow);
    }
  }

  return runFlows(flowsToRun, data);
};

export const onFail = (data: CountingData) => {
  const { countingChannel } = data;
  const flowsToRun = getFlows(countingChannel).filter(flow => flow.triggers.slice(0, limits.flows.triggers).some(trigger => trigger.type === "countfail"));

  return runFlows(flowsToRun, data);
};

export const onTimeout = (data: CountingData) => {
  const { countingChannel } = data;
  const flowsToRun = getFlows(countingChannel).filter(flow => flow.triggers.slice(0, limits.flows.triggers).some(trigger => trigger.type === "timeout"));

  return runFlows(flowsToRun, data);
};

function getFlows({ flows }: CountingChannel): Array<Flow> {
  return Array.from(flows.values())
    .filter(flow => !flow.disabled)
    .slice(0, limits.flows.amount);
}

async function testFlow(flow: Flow, data: CountingData): Promise<boolean> {
  for (const trigger of flow.triggers.slice(0, limits.flows.triggers)) {
    if (await triggers[trigger.type].check(data, trigger.data)) return true;
  }

  return false;
}

async function runFlows(flows: Array<Flow>, data: CountingData) {
  for (const flow of flows) {
    try {
      for (const action of flow.actions.slice(0, limits.flows.actions)) {
        await actions[action.type].run(data, action.data);
      }
    } catch (e) {
      countrLogger.verbose(`Failed to run flow on message ${data.message.url}: ${inspect(e)}`);
    }
  }
}
