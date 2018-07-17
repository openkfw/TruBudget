const fs = require("fs");

const readDirectory = location => fs.readdirSync(location);
const readJsonFile = file => {
  const content = fs.readFileSync(file);
  return JSON.parse(content);
};
module.exports = {
  readDirectory,
  readJsonFile
};
