const HDWalletProvider = require('truffle-hdwallet-provider');

require('dotenv').config();

module.exports = {
  //自定义contracts目录
  // contracts_directory: "./allMyStuff/someStuff/theContractFolder",
  //自定义build目录
  // contracts_build_directory: "./output",
  // 自定义 deploy 目录
  migrations_directory: './migrations/aave',
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  api_keys: {
    etherscan: process.env.ETHERSCAN_KEY,
  },

  networks: {
    ganache: { host: '39.102.101.142', port: 8545, network_id: '1337' }, // ganache
    builder: { host: '47.75.58.188', port: 8545, network_id: '31337' }, // builder
    development: { host: '47.75.58.188', port: 8545, network_id: '31337' },

    kovan: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNENOMIC,
          'https://kovan.infura.io/v3/' + process.env.INFURA_API_KEY,
          0,
          10
        ),
      network_id: 42, // Kovan's id
      gas: 6700000, // Gas sent with each transaction (default: ~6700000)
      gasPrice: 20000000000, // 20 gwei (in wei) (default: 100 gwei)
    },

    main: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNENOMIC,
          'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY,
          0,
          10
        ),
      network_id: 1, // Main's id
      gas: 3500000, // Gas sent with each transaction (default: ~5000000)
      gasPrice: 90000000000, // 75 gwei (in wei) (default: 100 gwei)
    },
  },

  plugins: ['solidity-coverage', 'truffle-plugin-verify'],

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.6.12', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 250,
        },
      },
    },
  },
};
