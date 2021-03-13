module.exports = {
  description: "Get the current count.",
  options: []
};

module.exports.run = async (send, { gdb }) => {
  const { count } = gdb.get();
  send({ content: `ℹ The current count is ${count}.` });
};
