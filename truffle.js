var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
  networks: {
    development: {
      // I removed this due to an issue with tx nonce - see this post:
      // https://stackoverflow.com/questions/45585735/testrpc-ganache-the-tx-doesnt-have-the-correct-nonce
      // provider: function() {
      //   return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
      // },
      host: "127.0.0.1",
      port: 7545,
      network_id: '*',
      gas: 6000000
    }
  },
  compilers: {
    solc: {
      version: "^0.4.25"
    }
  }
};