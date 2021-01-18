const Migrations = artifacts.require('Migrations');

module.exports = function (deployer, network, accounts) {
  // console.log(accounts)
  // console.log(deployer.networks[network].from)
  // return;
  deployer.deploy(Migrations);
};
