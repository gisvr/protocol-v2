// ============ Contracts ============

const LendingPoolAddressProvider = artifacts.require('LendingPoolAddressesProvider');
const DefaultReserveInterestRateStrategy = artifacts.require('DefaultReserveInterestRateStrategy');

const StableDebtToken = artifacts.require('StableDebtToken');
const VariableDebtToken = artifacts.require('VariableDebtToken');
const AToken = artifacts.require('AToken');
const LendingPoolConfigurator = artifacts.require('LendingPoolConfigurator');

const LendingPoolCollateralManager = artifacts.require('LendingPoolCollateralManager');

const MockFlashLoanReceiver = artifacts.require('MockFlashLoanReceiver');

const IncentivesController = artifacts.require('IncentivesController');

const WalletBalanceProvider = artifacts.require('WalletBalanceProvider');

module.exports = async (deployer, network, accounts) => {
  let sender = deployer.networks[network].from;
  let tokenList = global.tokenList;
  // console.log(await tokenList[0].obj.name())
  let incentivesController = await IncentivesController.deployed();
  let treasuryAddress = sender;

  let addressesProvider = await LendingPoolAddressProvider.deployed();
  const lpAddress = await addressesProvider.getLendingPool();
  let lpConfAddr = await addressesProvider.getLendingPoolConfigurator();
  let configurator = await LendingPoolConfigurator.at(lpConfAddr);

  for (const token of tokenList) {
    let tokenAddr = token.obj.address;
    let symbol = token.symbol;
    let incentivesAddr = incentivesController.address;
    let strategyRates = token.strategy;
    let reserveDecimals = token.decimals;
    // Deploy stable and variable deployers and save implementations ->await stableAndVariableTokensHelper.initDeployment(tokens, symbols, incentivesController.address)
    await deployer.deploy(
      StableDebtToken,
      lpAddress,
      tokenAddr,
      'Aave variable debt bearing ' + symbol,
      symbol,
      incentivesAddr
    );
    let stables = await StableDebtToken.deployed();

    await deployer.deploy(
      VariableDebtToken,
      lpAddress,
      tokenAddr,
      'variableDebt ' + symbol,
      symbol,
      incentivesAddr
    );

    let variables = await VariableDebtToken.deployed();

    // Deploy atokens and rate strategies and save implementations - > aTokensAndRatesHelper.initDeployment(

    await deployer.deploy(
      AToken,
      lpAddress,
      tokenAddr,
      treasuryAddress,
      'Aave interest bearing ' + symbol,
      'a' + symbol,
      incentivesAddr
    );

    let aTokens = await AToken.deployed();

    await deployer.deploy(
      DefaultReserveInterestRateStrategy,
      addressesProvider.address,
      ...strategyRates
    );

    let strategies = await DefaultReserveInterestRateStrategy.deployed();

    // Deploy init reserves per chunks  - >await aTokensAndRatesHelper.initReserve(

    let admin = await addressesProvider.getPoolAdmin();

    // console.log(admin, sender)
    // expect(admin).to.be.eq(sender, 'admin != sender');
    await configurator.initReserve(
      aTokens.address,
      stables.address,
      variables.address,
      reserveDecimals,
      strategies.address
    );
    let baseLTVs = token.collateral.baseLTVs,
      liquidationThresholds = token.collateral.liquidationThresholds,
      liquidationBonus = token.collateral.liquidationBonus;
    await configurator.configureReserveAsCollateral(
      tokenAddr,
      baseLTVs,
      liquidationThresholds,
      liquidationBonus
    );
    let stableBorrowRateEnabled = token.borrow.stableBorrowRateEnabled;
    await configurator.enableBorrowingOnReserve(tokenAddr, stableBorrowRateEnabled);
    let reserveFactor = token.borrow.reserveFactor;
    await configurator.setReserveFactor(tokenAddr, reserveFactor);
  }
  await deployer.deploy(LendingPoolCollateralManager);
  let collateralManager = await LendingPoolCollateralManager.deployed();
  await addressesProvider.setLendingPoolCollateralManager(collateralManager.address);

  await deployer.deploy(MockFlashLoanReceiver, addressesProvider.address);
  await deployer.deploy(WalletBalanceProvider);
};
