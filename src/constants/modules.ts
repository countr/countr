interface Module {
  description: string;
  image?: string;
  incompatible?: Array<keyof typeof modules>;
}

const embed: Module = {
  description: "Repost the message in an embed.",
  incompatible: ["reposting", "webhook"],
};

const nodelete: Module = {
  description: "No messages get deleted, even if you fail to count.",
};

const recover: Module = {
  description: "Remove invalid messages when the bot restarts.",
};

const reposting: Module = {
  description: "Repost the message.",
  incompatible: ["embed", "webhook"],
};

const spam: Module = {
  description: "Allow people to count multiple times in a row. Previously known as `allowSpam`.",
};

const talking: Module = {
  description: "Allow people to send text after the count.",
};

const webhook: Module = {
  description: "Repost the message in a webhook.",
  incompatible: ["embed", "reposting"],
};

// make variable to get types. honestly surprised TS allows this but I'm not going to question it
const modules = { embed, nodelete, recover, reposting, spam, talking, webhook } as const;
export default modules;
