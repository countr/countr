import type{ Client } from "discord.js";
import TokenReset from "discord-token-reset";
import config from "../config";

export default function handleAutomaticTokenReset(client: Client<true>): void {
  if (!config.github?.token || !config.github.tokenreset.repo || !config.github.tokenreset.committer.name || !config.github.tokenreset.committer.email) return;
  const tokenReset = new TokenReset({
    token: config.github.token,
    repository: config.github.tokenreset.repo,
    branch: "tokens",
    committerName: config.github.tokenreset.committer.name,
    committerEmail: config.github.tokenreset.committer.email,
  });
  tokenReset.listenToClient(client);
}
