import type { ContextMenuCommand } from ".";

export default {
  type: "USER",
  execute: (interaction, ephemeral, target, document, selectedCountingChannel) => {
    const countingChannel = document.channels.get(selectedCountingChannel);
    const timeout = countingChannel?.timeouts.get(target.id);

    if (timeout && timeout.getTime() > Date.now()) {
      return interaction.reply({
        content: interaction.user.id === target.id ?
          `💨 You are timed out in <#${selectedCountingChannel}>, it expires <t:${Math.round(timeout.getTime() / 1000)}:R>.` :
          `💨 <@\${target}> is timed out in <#${selectedCountingChannel}>, it expires <t:${Math.round(timeout.getTime() / 1000)}:R>.`,
        ephemeral,
      });
    }

    return interaction.reply({
      content: interaction.user.id === target.id ?
        `💨 You are not timed out in <#${selectedCountingChannel}>.` :
        `💨 ${target} is not timed out in <#${selectedCountingChannel}>.`,
      ephemeral,
    });
  },
  requireSelectedCountingChannel: true,
} as ContextMenuCommand;