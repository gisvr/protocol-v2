const BigNumber = require('bignumber.js');

let toRay = (num) => {
  const oneRay = new BigNumber(Math.pow(10, 27));
  return new BigNumber(num).multipliedBy(oneRay).toFixed();
};

const oneEth = new BigNumber(Math.pow(10, 18));

const LendingPoolAddressProvider = artifacts.require('LendingPoolAddressesProvider');
const LendingPool = artifacts.require('LendingPool');
const LendingPoolConfigurator = artifacts.require('LendingPoolConfigurator');

const LendingRateOracle = artifacts.require('LendingRateOracle');
const IncentivesController = artifacts.require('IncentivesController');

const StableAndVariableTokensHelper = artifacts.require('StableAndVariableTokensHelper');
const ATokensAndRatesHelper = artifacts.require('ATokensAndRatesHelper');

const AaveOracle = artifacts.require('AaveOracle');

const WETHGateway = artifacts.require('WETHGateway');
const WETH9Mocked = artifacts.require('WETH9Mocked');

module.exports = async (deployer, network, accounts) => {
  let [sender, alice, bob] = accounts;

  const weth = await WETH9Mocked.deployed();
  let reserveAddr = weth.address;
  let total = oneEth.times(10000);
  await weth.mint(total, { from: sender });
  await weth.mint(total, { from: alice });
  await weth.mint(total, { from: bob });

  console.log('WETH', reserveAddr);

  let addressesProvider = await LendingPoolAddressProvider.deployed();
  const lpAddress = await addressesProvider.getLendingPool();

  let lendingPool = await LendingPool.at(lpAddress);
  let lpConfAddr = await addressesProvider.getLendingPoolConfigurator();
  // let configurator = await LendingPoolConfigurator.at(lpConfAddr);

  let reserves1 = await lendingPool.getReservesList();
  // console.log("old", reserves1)
  if (reserves1.includes(reserveAddr)) return;

  const lendingRateOracle = await LendingRateOracle.deployed();
  const incentivesController = await IncentivesController.deployed();
  let treasuryAddress = sender;

  let tokens = [reserveAddr];
  let rates = [toRay(0.039)];
  let symbols = ['WETH'];

  // weth ignore
  // const aaveOracle = await AaveOracle.deployed();
  // aaveOracle.setAssetSources(address[] calldata assets, address[] calldata sources)

  await deployer.deploy(StableAndVariableTokensHelper, lpAddress, addressesProvider.address);

  const stableAndVariableTokensHelper = await StableAndVariableTokensHelper.deployed();

  await lendingRateOracle.transferOwnership(stableAndVariableTokensHelper.address);

  await stableAndVariableTokensHelper.setOracleBorrowRates(
    tokens,
    rates,
    lendingRateOracle.address
  );
  let debtTx = await stableAndVariableTokensHelper.initDeployment(
    tokens,
    symbols,
    incentivesController.address
  );

  let debtEvent = debtTx.logs.find((val) => val.event == 'deployedContracts').args;

  await stableAndVariableTokensHelper.setOracleOwnership(lendingRateOracle.address, sender);

  await deployer.deploy(ATokensAndRatesHelper, lpAddress, addressesProvider.address, lpConfAddr);

  let admin = await addressesProvider.getPoolAdmin();
  console.log('PoolAdmin', admin);

  const aTokensAndRatesHelper = await ATokensAndRatesHelper.deployed();

  await addressesProvider.setPoolAdmin(aTokensAndRatesHelper.address);

  let strategyRates = [[toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)]];
  let aTokenTx = await aTokensAndRatesHelper.initDeployment(
    tokens,
    symbols,
    strategyRates,
    treasuryAddress,
    incentivesController.address
  );
  // console.log(aTokenTx.logs)
  let aTokenEvent = aTokenTx.logs.find((val) => val.event == 'deployedContracts').args;

  let baseLTVs = ['8000'];
  let liquidationThresholds = ['8250'];
  let liquidationBonuses = ['10500'];
  let reserveFactors = ['1000'];
  let stableBorrowingEnabled = [true];
  await aTokensAndRatesHelper.configureReserves(
    tokens,
    baseLTVs,
    liquidationThresholds,
    liquidationBonuses,
    reserveFactors,
    stableBorrowingEnabled
  );

  let stables = [debtEvent.stableToken];
  let variables = [debtEvent.variableToken];
  let aTokens = [aTokenEvent.aToken];
  let strategies = [aTokenEvent.strategy];
  let reserveDecimals = [18];
  await aTokensAndRatesHelper.initReserve(stables, variables, aTokens, strategies, reserveDecimals);

  await addressesProvider.setPoolAdmin(admin);

  let reserves2 = await lendingPool.getReservesList();

  console.log('new', reserves2);

  await deployer.deploy(WETHGateway, weth.address, lpAddress);
};
