import type { ButtonComponentData, InteractionEditReplyOptions, Message, Snowflake } from "discord.js";
import { ButtonStyle, Collection, ComponentType, MessageType, TextInputStyle, time } from "discord.js";
import { promisify } from "util";
import type { ChatInputCommand } from "..";
import { messageFetchLimit } from "../../../constants/discord";
import { buttonComponents } from "../../../handlers/interactions/components";
import { createModalTextInput, getModalTextInput, modals } from "../../../handlers/interactions/modals";

// if promise then it's running, if function then queued
const queue = new Map<Snowflake, (() => Promise<void>) | Promise<void>>();

const sleep = promisify(setTimeout);

const command: ChatInputCommand = {
  description: "Fetch scores from the counting channel and return an importable JSON of all the scores",
  serverCooldown: 3600,
  requireSelectedCountingChannel: true,
  async execute(interaction, ephemeral, _, [countingChannelId]) {
    await interaction.deferReply({ ephemeral });

    // set up timer variables here so we can cancel later
    let queueUpdate: NodeJS.Timeout | null = null;
    let updateProgress: NodeJS.Timeout | null = null;

    // set up cancel button
    let cancelled = false;
    const cancelButton: ButtonComponentData = {
      type: ComponentType.Button,
      customId: `${interaction.id}:cancel`,
      label: "Cancel",
      style: ButtonStyle.Danger,
    };
    const cancelButtonAlone: Exclude<InteractionEditReplyOptions["components"], undefined> = [{ type: ComponentType.ActionRow, components: [cancelButton] }];
    buttonComponents.set(cancelButton.customId, {
      allowedUsers: [interaction.user.id],
      callback(button) {
        cancelled = true;
        queue.delete(interaction.guildId);
        if (queueUpdate) clearInterval(queueUpdate as never);
        if (updateProgress) clearInterval(updateProgress as never);
        // handling the next in queue is done further down so we don't need it here

        void button.update({ content: "🕳️ Score fetching cancelled.", components: [] });
      },
    });

    // queue up if there's already a request running, or start the request
    if (queue.size) {
      queueUpdate = setInterval(() => void interaction.editReply({ content: `⏳ Your request has been queued. You are number ${Array.from(queue.keys()).indexOf(interaction.guildId) + 1} in the queue.`, components: cancelButtonAlone }), 5000);
      queue.set(interaction.guildId, startSearch);
      void interaction.editReply({ content: `⏳ Your request has been queued. You are number ${Array.from(queue.keys()).indexOf(interaction.guildId) + 1} in the server queue.`, components: cancelButtonAlone });
    } else queue.set(interaction.guildId, startSearch());

    async function startSearch(): Promise<void> {
      if (queueUpdate) {
        clearInterval(queueUpdate as never);
        queueUpdate = null;
      }

      // update the user of the progress
      let fetched = 0;
      let totalMessages: null | number = null;
      const startDate = Date.now();
      function updateMessage(): void {
        const etaEndDate = totalMessages && new Date(startDate + totalMessages / fetched * (Date.now() - startDate));
        void interaction.editReply({
          content: `⏳ Fetching scores... ${totalMessages ? `${fetched}/${totalMessages}` : fetched} messages fetched. ${etaEndDate ? `Estimated to be finished ${time(etaEndDate, "R")}` : ""}`,
          ...{
            components: totalMessages ?
              cancelButtonAlone :
              [
                {
                  type: ComponentType.ActionRow,
                  components: [
                    cancelButton,
                    {
                      type: ComponentType.Button,
                      label: "(Optional) Set the total message count for estimation",
                      customId: `${interaction.id}:set-total`,
                      style: ButtonStyle.Secondary,
                    },
                  ],
                },
              ],
          },
        });
      }
      updateMessage();
      updateProgress = setInterval(updateMessage, 5000);

      // add button and modals to allow the user to set the total number of messages, since the bot can't check this beforehand
      buttonComponents.set(`${interaction.id}:set-total`, {
        allowedUsers: [interaction.user.id],
        callback: button => void button.showModal({
          title: "Set the total message count for estimation",
          customId: `${interaction.id}:submit-total`,
          components: [
            createModalTextInput({
              style: TextInputStyle.Short,
              customId: "total",
              label: "Press CTRL+F + Enter in the counting channel",
              minLength: 1,
              maxLength: 100,
              required: true,
            }),
          ],
        }),
      });
      modals.set(`${interaction.id}:submit-total`, {
        callback: modal => {
          const total = Number(getModalTextInput(modal.components, "total"));
          if (isNaN(total) || !total) return void modal.reply({ content: "❌ Invalid number.", ephemeral: true });
          totalMessages = total;
          if (updateProgress) clearInterval(updateProgress as never);
          updateMessage();
          updateProgress = setInterval(updateMessage, 5000);
          return void modal.reply({ content: "✅ Total message count set. You can now see an estimation in the original message!", ephemeral: true });
        },
      });

      // start fetching
      const channel = interaction.guild.channels.cache.get(countingChannelId);
      if (channel?.isTextBased()) {
        const scores: Record<Snowflake, number> = {};
        let newBulkOfMessages = new Collection<Snowflake, Message>();
        do {
          const before = newBulkOfMessages.sort((a, b) => Number(BigInt(b.id) - BigInt(a.id))).lastKey();
          newBulkOfMessages = await channel.messages.fetch({ limit: messageFetchLimit, cache: false, ...before && { before } }).catch(() => new Collection());
          fetched += newBulkOfMessages.size;
          newBulkOfMessages.forEach(message => {
            if (message.author.bot || ![MessageType.Default, MessageType.Reply].includes(message.type)) return;
            if (scores[message.author.id]) scores[message.author.id] = scores[message.author.id]! + 1;
            else scores[message.author.id] = 1;
          });
          await sleep(1000);
        // eslint-disable-next-line no-unmodified-loop-condition -- `cancelled` is modified elsewhere
        } while (newBulkOfMessages.size === messageFetchLimit && !cancelled);


        if (!cancelled) {
          clearInterval(updateProgress as never);

          // send the scores and finish up
          void interaction.editReply({
            content: `✅ I've tallied up a total of ${Object.values(scores).reduce((a, b) => a + b, 0)} messages from ${Object.keys(scores).length} users in <#${countingChannelId}>.`,
            files: [{ name: `Countr Fetched scores of guild ${interaction.guildId} channel ${interaction.channelId}.json`, attachment: Buffer.from(JSON.stringify(scores, null, 2)) }],
            components: [],
          });
        }
      }

      // clean up and start the next in queue
      queue.delete(interaction.guildId);
      const [nextInQueue] = Array.from(queue.keys());
      const nextSearch = nextInQueue && queue.get(nextInQueue);
      if (typeof nextSearch === "function") queue.set(nextInQueue!, nextSearch());
    }
  },
};

export default { ...command } as ChatInputCommand;
