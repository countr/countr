import type { SlashCommand } from "../..";
import superagent from "superagent";

export default {
  description: "Import scores",
  options: [
    {
      type: "STRING",
      name: "json_url",
      description: "URL to the JSON file to import",
      required: true,
    },
    {
      type: "STRING",
      name: "mode",
      description: "Choose to either set the score or add to it",
      choices: [
        {
          name: "Set scores",
          value: "set",
        }, {
          name: "Add to scores",
          value: "add",
        },
      ],
    },
  ],
  // eslint-disable-next-line camelcase -- slash command options can't be camel case, we make it camel case though
  execute: (interaction, _, { json_url: inputUrl, mode }: { json_url: string; mode: "set" | "add"; }, document, selectedCountingChannel) => {
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
      const scores = getScores(json);
      if (!scores) {
        return interaction.reply({
          content: "❌ Invalid scores",
          ephemeral: true,
        });
      }

      const countingChannel = document.channels.get(selectedCountingChannel);
      for (const memberId in scores) {
        const newValue = mode === "set" ? scores[memberId] : (countingChannel?.scores.get(memberId) || 0) + scores[memberId];
        countingChannel?.scores.set(memberId, newValue);
      }
      document.safeSave();

      return interaction.reply({
        content: `✅ Imported scores of ${Object.keys(scores).length} members!`,
      });
    }).catch(() => interaction.reply({
      content: "❌ Failed to import flow configuration",
      ephemeral: true,
    }));
  },
  requireSelectedCountingChannel: true,
} as SlashCommand;

/* eslint-disable @typescript-eslint/no-explicit-any */

function getScores(input: any): Record<string, number> | null {
  if (typeof input !== "object") return null;

  // remove _id if it exists
  if (input._id) delete input._id; // eslint-disable-line no-underscore-dangle

  // test if input has length
  if (Object.keys(input).length === 0) return null;

  // test if input's keys are all strings with only 17-19 numbers
  if (!Object.keys(input).every(key => typeof key === "string" && /^\d{17,19}$/.test(key))) return null;

  // test if input's values are all numbers above or equal to 0
  if (Object.values(input).every(value => typeof value === "number" && value >= 0)) return null;

  // test if input's keys are duplicate
  if (new Set(Object.keys(input)).size !== Object.keys(input).length) return null;

  return input as Record<string, number>;
}

function getURL(input: string): URL | null {
  try {
    return new URL(input);
  } catch (e) {
    return null;
  }
}
