const shell = require("shelljs");

const isMultichainReady = (chainName) => {
  const result = shell.exec(`multichain-cli ${chainName} getinfo`);
  return result.code === 0;
};

module.exports = {
  isMultichainReady,
};
