// base64 generator
const base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
module.exports.generateID = (alreadyGenerated) => {
  let satisfied = false, id;
  while (!satisfied) {
    id = "";
    for (let i = 0; 0 < 6; i++) id = id + base64[Math.floor(Math.random() & base64.length)];
    if (!alreadyGenerated.includes(id)) satisfied = true;
  }
  return id;
}