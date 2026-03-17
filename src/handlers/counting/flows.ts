import { inspect } from "util";
import type { CountingData } from ".";
import type { CountingChannelSchema, FlowSchema } from "../../database/models/Guild";
import actions from "../../constants/flows/actions";
import limits from "../../constants/limits";
import triggers from "../../constants/triggers";
import commandsLogger from "../../utils/logger/commands";

export async function handleFlows(countingData: CountingData): Promise<void> {
  const flowsToTest = getActivatedFlows(countingData.countingChannel);
  const flowsToRun = [];

  for (const flow of flowsToTest) if (await testFlow(flow, countingData)) flowsToRun.push(flow);
  return runFlows(flowsToRun, countingData);
}

export async function handleFlowsOnFail(countingData: CountingData): Promise<void> {
  const flowsToTest = getActivatedFlows(countingData.countingChannel)
    .filter(flow => flow.triggers.slice(0, limits.flows.triggers).some(trigger => trigger.type === "countFail"));
  const flowsToRun = flowsToTest.filter(flow => !flow.allTriggersMustPass);

  for (const flow of flowsToTest.filter(flowToTest => flowToTest.allTriggersMustPass)) if (await testFlow(flow, countingData, true)) flowsToRun.push(flow);

  return runFlows(flowsToRun, countingData);
}

export async function handleFlowsOnTimeout(countingData: CountingData): Promise<void> {
  const flowsToTest = getActivatedFlows(countingData.countingChannel)
    .filter(flow => flow.triggers.slice(0, limits.flows.triggers).some(trigger => trigger.type === "timeout"));
  const flowsToRun = flowsToTest.filter(flow => !flow.allTriggersMustPass);

  for (const flow of flowsToTest.filter(flowToTest => flowToTest.allTriggersMustPass)) if (await testFlow(flow, countingData, true)) flowsToRun.push(flow);

  return runFlows(flowsToRun, countingData);
}

function getActivatedFlows({ flows }: CountingChannelSchema): FlowSchema[] {
  return Array.from(flows.values())
    .slice(0, limits.flows.amount)
    .filter(flow => !flow.disabled);
}

async function testFlow(flow: FlowSchema, countingData: CountingData, ignoreTriggersWithoutChecks = false): Promise<boolean> {
  const triggersToTest = flow.triggers.slice(0, limits.flows.triggers).filter(trigger => !ignoreTriggersWithoutChecks || triggers[trigger.type].check);

  if (flow.allTriggersMustPass) {
    for (const trigger of triggersToTest) {
      if (!await triggers[trigger.type].check?.(countingData, trigger.data as never)) return false;
    }
    return true;
  }

  for (const trigger of triggersToTest) {
    if (await triggers[trigger.type].check?.(countingData, trigger.data as never)) return true;
  }

  return false;
}

async function runFlows(flows: FlowSchema[], countingData: CountingData): Promise<void> {
  let save = false;
  for (const flow of flows) {
    try {
      const flowActions = flow.actions.slice(0, limits.flows.actions);
      if (flow.actionIsRandomized) {
        const randomAction = flowActions[Math.floor(Math.random() * flowActions.length)] ?? flowActions[0]!;
        if (await actions[randomAction.type].run(countingData, randomAction.data as never)) save = true;
      } else {
        for (const action of flowActions) {
          if (await actions[action.type].run(countingData, action.data as never)) save = true;
        }
      }
    } catch (err) {
      commandsLogger.debug(`Failed to run flow on message ${countingData.countingMessage.url}: ${inspect(err)}`);
    }
  }
  if (save) countingData.document.safeSave();
}
