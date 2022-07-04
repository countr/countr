import type { ChatInputCommand } from "../..";

const command: ChatInputCommand = {
  description: "Export the entire database",
  considerDefaultPermission: false,
  async execute(interaction, ephemeral, document) {
    const raw = document.toJSON();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- remove _id and __v from the export as these are irrelevant to the user
    const { _id, __v, ...json } = raw;

    // uploading might take a while so defer first
    await interaction.deferReply({ ephemeral });

    return void interaction.editReply({
      content: "✅ Successfully exported all data stored on guild.",
      files: [{ name: `Countr Data from guild ${interaction.guildId}.json`, attachment: Buffer.from(JSON.stringify(json, null, 2)) }],
    });
  },
};

export default { ...command } as ChatInputCommand;
