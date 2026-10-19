import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const MEZO_TESTNET_RPC = "https://rpc.test.mezo.org";
const MEZO_TESTNET_CHAIN_ID = 31611;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    mezotestnet: {
      url: process.env.MEZO_TESTNET_RPC_URL || MEZO_TESTNET_RPC,
      chainId: MEZO_TESTNET_CHAIN_ID,
      accounts: process.env.MEZO_TESTNET_PRIVATE_KEY
        ? [process.env.MEZO_TESTNET_PRIVATE_KEY]
        : [],
    },
    // Mezo Buildathon allows deployment on Mezo, Ethereum, Base, or BNB Chain.
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      chainId: 8453,
      accounts: process.env.BASE_PRIVATE_KEY
        ? [process.env.BASE_PRIVATE_KEY]
        : [],
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "london",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
