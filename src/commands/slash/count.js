module.exports = {
  description: "asss",
  options: []
};

module.exports.run = async (send, { gdb }) => {
  const { count } = gdb.get();
  send({ content: `ℹ The current count is ${count}.` })
};