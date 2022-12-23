require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    polygon: {
      url: process.env.ALCHEMY_URL,
      accounts: [process.env.PK]
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGON_PK
    }
  }
};
