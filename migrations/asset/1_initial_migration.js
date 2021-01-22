// const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { BN } = require('ethereumjs-util');

const Migrations = artifacts.require('Migrations');

module.exports = async (deployer, network, accounts) => {
  let sender = accounts[0];
  let senderBal = await web3.eth.getBalance(sender);

  await deployer.deploy(Migrations);

  let chainId = 0; //await web3.eth.getChainId();
  console.log(
    `Network %s ChainId %s Sender %s Bal %s`,
    network,
    chainId,
    sender,
    senderBal.toString()
  ); //
};
