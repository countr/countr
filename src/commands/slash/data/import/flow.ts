import { Flow, FlowOptions } from "../../../../database/models/Guild";
import { PropertyValue } from "../../../../types/flows/properties";
import { SlashCommand } from "../../../../types/command";
import actions from "../../../../constants/flows/actions";
import { generateId } from "../../../../utils/crypto";
import superagent from "superagent";
import triggers from "../../../../constants/flows/triggers";

export default {
  description: "Import a flow configuration",
  options: [
    {
      type: "STRING",
      name: "json_url",
      description: "URL to the JSON file to import",
      required: true,
    },
  ],
  // eslint-disable-next-line camelcase -- slash command options can't be camel case, we make it camel case though
  execute: (interaction, _, { json_url: inputUrl }: { json_url: string; }, document, selectedCountingChannel) => {
    // test url
    const url = getURL(inputUrl);
    if (!url) {
      return interaction.reply({
        content: "❌ Invalid URL",
        ephemeral: true,
      });
    }

    // check that it comes from Discord
    if (url.origin !== interaction.client.options.http?.cdn) {
      return interaction.reply({
        content: `❌ The URL must come from Discord (link starting with \`${interaction.client.options.http?.cdn}\`) to avoid abuse. Try and upload the file to Discord and use the attachment URL from there.`,
        ephemeral: true,
      });
    }

    // fetch, test and add
    superagent.get(inputUrl).then(json => json.body).then(json => {
      const flow = getFlow(json);
      if (!flow) {
        return interaction.reply({
          content: "❌ Invalid flow configuration",
          ephemeral: true,
        });
      }

      const flowId = generateId();
      document.channels.get(selectedCountingChannel || "")?.flows.set(flowId, flow);
      document.safeSave();

      return interaction.reply({
        content: `✅ Imported flow configuration as flow ID \`${flowId}\`!`,
      });
    }).catch(() => interaction.reply({
      content: "❌ Failed to import flow configuration",
      ephemeral: true,
    }));
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;

/* eslint-disable @typescript-eslint/no-explicit-any */

function getFlow(input: any): Flow | null {
  if (typeof input !== "object") return null;

  // check triggers
  const triggers = getFlowOptions(input.triggers, "trigger");
  if (triggers === null || triggers.length < 0) return null;

  // check actions
  const actions = getFlowOptions(input.actions, "action");
  if (actions === null || actions.length < 0) return null;

  // construct
  const flow: Flow = { triggers, actions };

  // additional information
  if (typeof input.name === "string") flow.name = input.name.substring(0, 32);
  if (input.disabled === true) flow.disabled = true;

  return flow;
}

function getFlowOptions(input: any, triggerOrAction: "trigger" | "action"): Array<FlowOptions> | null {
  if (!Array.isArray(input)) return null;

  const options = input.map((option: any) => {
    if (typeof option !== "object") return null;
    const allOptions = triggerOrAction === "trigger" ? triggers : actions;

    // check type
    if (
      typeof option.type !== "string" ||
      !allOptions[option.type]
    ) return null;

    // check value
    const data = getFlowOptionData(option.data);
    if (data === null) return null;

    const flowOption: FlowOptions = { type: option.type, data };

    return flowOption;
  });

  return options as Array<FlowOptions>;
}

function getFlowOptionData(input: any): Array<PropertyValue> | null {
  if (!Array.isArray(input)) return null;

  const data = input.map<PropertyValue | null>((property: any) => {
    if (
      ["string", "number"].includes(typeof property) === false &&
      Array.isArray(property) === false
    ) return null;

    if (Array.isArray(property)) {
      const list = property.map(getFlowOptionData);
      if (list.includes(null)) return null;
      return list;
    }

    return property;
  });

  if (data.includes(null)) return null;

  return data as Array<PropertyValue>;
}

function getURL(input: string): URL | null {
  try {
    return new URL(input);
  } catch (e) {
    return null;
  }
}
