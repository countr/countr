import type { CountingChannelSchema, FlowSchema } from "../../database/models/Guild";
import type { CountingData } from ".";
import actions from "../../constants/flows/actions";
import { inspect } from "util";
import limits from "../../constants/limits";
import { mainLogger } from "../../utils/logger/main";
import triggers from "../../constants/triggers";

export async function handleFlows(countingData: CountingData): Promise<void> {
  const flowsToTest = getActivatedFlows(countingData.countingChannel);
  const flowsToRun = [];

  for (const flow of flowsToTest) if (await testFlow(flow, countingData)) flowsToRun.push(flow);
  return runFlows(flowsToRun, countingData);
}

export function handleFlowsOnFail(countingData: CountingData): Promise<void> {
  const flowsToRun = getActivatedFlows(countingData.countingChannel)
    .filter(flow => flow.triggers.slice(0, limits.flows.triggers).some(trigger => trigger.type === "countFail"));

  return runFlows(flowsToRun, countingData);
}

export function handleFlowsOnTimeout(countingData: CountingData): Promise<void> {
  const flowsToRun = getActivatedFlows(countingData.countingChannel)
    .filter(flow => flow.triggers.slice(0, limits.flows.triggers).some(trigger => trigger.type === "timeout"));

  return runFlows(flowsToRun, countingData);
}

function getActivatedFlows({ flows }: CountingChannelSchema): FlowSchema[] {
  return Array.from(flows.values())
    .slice(0, limits.flows.amount)
    .filter(flow => !flow.disabled);
}

async function testFlow(flow: FlowSchema, countingData: CountingData): Promise<boolean> {
  for (const trigger of flow.triggers.slice(0, limits.flows.triggers)) {
    if (await triggers[trigger.type].check?.(countingData, trigger.data as never)) return true;
  }
  return false;
}

async function runFlows(flows: FlowSchema[], countingData: CountingData): Promise<void> {
  let save = false;
  for (const flow of flows) {
    try {
      for (const action of flow.actions.slice(0, limits.flows.actions)) {
        if (await actions[action.type].run(countingData, action.data as never)) save = true;
      }
    } catch (err) {
      mainLogger.verbose(`Failed to run flow on message ${countingData.countingMessage.url}: ${inspect(err)}`);
    }
  }
  if (save) countingData.document.safeSave();
}
