import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-abi-exporter";
import "solidity-coverage";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";

import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    mainnet: {
      chainId: 1,
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.WALLET_PK || ""],
    },
    goerli: {
      chainId: 5,
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.WALLET_PK || ""],
    },
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        blockNumber: 18510000
      },
      accounts: {
        count: 150,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.21",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 9999,
      },
    },
  },
  gasReporter: {
    enabled: true,
  },
};

export default config;
