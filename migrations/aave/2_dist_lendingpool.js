// ============ Contracts ============

const LendingPoolAddressProvider = artifacts.require('LendingPoolAddressesProvider');
const LendingPoolAddressesProviderRegistry = artifacts.require(
  'LendingPoolAddressesProviderRegistry'
);

const ReserveLogic = artifacts.require('ReserveLogic');
const GenericLogic = artifacts.require('GenericLogic');
const ValidationLogic = artifacts.require('ValidationLogic');
const LendingPool = artifacts.require('LendingPool');

const LendingPoolConfigurator = artifacts.require('LendingPoolConfigurator');

const IncentivesController = artifacts.require('IncentivesController');
const WETH9Mocked = artifacts.require('WETH9Mocked');

module.exports = async (deployer, network, accounts) => {
  let sender = deployer.networks[network].from;
  //2_address_provider_registry---------
  let marketId = 'Mint';
  await deployer.deploy(LendingPoolAddressProvider, marketId);
  let addressesProvider = await LendingPoolAddressProvider.deployed();
  await addressesProvider.setPoolAdmin(sender);

  await deployer.deploy(LendingPoolAddressesProviderRegistry);
  let addressesProviderRegistry = await LendingPoolAddressesProviderRegistry.deployed();
  await addressesProviderRegistry.registerAddressesProvider(addressesProvider.address, 1);

  //3_lending_pool----------
  await deployer.deploy(ReserveLogic);
  await deployer.link(ReserveLogic, GenericLogic);

  await deployer.deploy(GenericLogic);
  await deployer.link(ReserveLogic, ValidationLogic);
  await deployer.link(GenericLogic, ValidationLogic);

  await deployer.deploy(ValidationLogic);
  await deployer.link(ValidationLogic, LendingPool);
  await deployer.link(ReserveLogic, LendingPool);

  await deployer.deploy(LendingPool);
  const lendingPoolImpl = await LendingPool.deployed();
  // Set lending pool impl to Address Provider
  await addressesProvider.setLendingPoolImpl(lendingPoolImpl.address);
  const lpAddress = await addressesProvider.getLendingPool();
  this.lpContractProxy = await LendingPool.at(lpAddress);

  await deployer.deploy(LendingPoolConfigurator);
  const lendingPoolConfiguratorImpl = await LendingPoolConfigurator.deployed();
  // Set lending pool conf impl to Address Provider
  await addressesProvider.setLendingPoolConfiguratorImpl(lendingPoolConfiguratorImpl.address);

  // Mock
  await deployer.deploy(IncentivesController);
  await deployer.deploy(WETH9Mocked);
};
