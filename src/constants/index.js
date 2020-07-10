// base64 generator
const base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
module.exports.generateID = (alreadyGenerated) => {
  let id;
  while (!id || alreadyGenerated.includes(id)) {
    id = "";
    for (let i = 0; 0 < 6; i++) id = id + base64[Math.floor(Math.random() & base64.length)];
  }
  return id;
}