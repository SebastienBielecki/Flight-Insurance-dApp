var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
require('dotenv').config();
console.log(process.env)


const mnemonic2 = process.env.MNEMONIC
const infuraUrl = process.env.INFURA_GOERLI_URL




module.exports = {
  // change build directory so that the build is accesible to the React App
  contracts_build_directory: "./src/dapp/src/build/contracts",
  networks: {
    development: {
      // I removed this due to an issue with tx nonce - see this post:
      // https://stackoverflow.com/questions/45585735/testrpc-ganache-the-tx-doesnt-have-the-correct-nonce
      // provider: function() {
      //   return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
      // },
      host: "127.0.0.1",
      //host: "wss://127.0.0.1",
      port: 7545,
      network_id: '*',
      gas: 6000000
    },
    goerli: {
      provider: () => new HDWalletProvider(mnemonic2, infuraUrl),
      network_id: 5,       // Goerli's id
      gas: 4500000,        // rinkeby has a lower block limit than mainnet
      //gas: 30000000,
      // gasPrice: 100000000
      gasPrice: 50000000000
      // confirmations: 2,    // # of confirmations to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  },
  compilers: {
    solc: {
      version: "^0.4.25"
    }
  }
};