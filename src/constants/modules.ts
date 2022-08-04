interface Module {
  description: string;
  image?: string;
  incompatible?: Array<keyof typeof modules>;
}

const embed: Module = {
  description: "Repost the message in an embed.",
  image: "https://i.promise.solutions/uM2pPX.gif",
  incompatible: ["reposting", "webhook"],
};

const recover: Module = {
  description: "Remove invalid messages when the bot restarts.",
  image: "https://i.promise.solutions/xu0imT.gif",
};

const reposting: Module = {
  description: "Repost the message.",
  incompatible: ["embed", "webhook"],
  image: "https://i.promise.solutions/7HqjEr.gif",
};

const spam: Module = {
  description: "Allow people to count multiple times in a row. Previously known as `allowSpam`.",
  image: "https://i.promise.solutions/ISe9n5.gif",
};

const talking: Module = {
  description: "Allow people to send text after the count.",
  image: "https://i.promise.solutions/uTpoA9.gif",
};

const webhook: Module = {
  description: "Repost the message in a webhook.",
  incompatible: ["embed", "reposting"],
  image: "https://i.promise.solutions/vTQhyU.gif",
};

// make variable to get types. honestly surprised TS allows this but I'm not going to question it
const modules = { embed, recover, reposting, spam, talking, webhook } as const;
export default modules;
