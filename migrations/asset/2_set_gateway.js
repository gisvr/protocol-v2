const BigNumber = require('bignumber.js');

let toRay = (num) => {
  const oneRay = new BigNumber(Math.pow(10, 27));
  return new BigNumber(num).multipliedBy(oneRay).toFixed();
};

const oneEth = new BigNumber(Math.pow(10, 18));

const LendingPoolAddressProvider = artifacts.require('LendingPoolAddressesProvider');
const LendingPool = artifacts.require('LendingPool');
const LendingPoolConfigurator = artifacts.require('LendingPoolConfigurator');

const WETH9Mocked = artifacts.require('WETH9Mocked');
const WETHGateway = artifacts.require('WETHGateway');

const ApiDataProvider = artifacts.require('ApiDataProvider');

module.exports = async (deployer, network, accounts) => {
  let [sender, alice, bob] = accounts;

  const weth = await WETH9Mocked.deployed();

  let addressesProvider = await LendingPoolAddressProvider.deployed();
  const lpAddress = await addressesProvider.getLendingPool();
  let lendingPool = await LendingPool.at(lpAddress);

  let reserves1 = await lendingPool.getReservesList();
  console.log('old', reserves1);
  if (reserves1.includes(weth.address)) {
    await deployer.deploy(WETHGateway, weth.address, lpAddress);
  }

  let wETHGateway = await WETHGateway.deployed();

  console.log('wETHGateway', wETHGateway.address);

  await deployer.deploy(ApiDataProvider, addressesProvider.address, wETHGateway.address);

  let apiDataProvider = await ApiDataProvider.deployed();

  console.log('ApiDataProvider', apiDataProvider.address);

  console.log('LendingPoolAddressProvider', addressesProvider.address);
};
