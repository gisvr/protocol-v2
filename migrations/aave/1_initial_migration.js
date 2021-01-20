// const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { BN } = require('ethereumjs-util');

const Migrations = artifacts.require('Migrations');

module.exports = async (deployer, network, accounts) => {
  let senderBal = await web3.eth.getBalance(accounts[0]);
  console.log(senderBal.toString()); //
  deployer.deploy(Migrations);
};
