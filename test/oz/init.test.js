const { accounts, contract, web3, defaultSender } = require('@openzeppelin/test-environment');
const {
  BN,
  time, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const { tracker } = require('@openzeppelin/test-helpers/src/balance');

const { expect } = require('chai');

const { eContractid, TokenContractId, RateParams } = require('./base');
let LendingPoolAddressProvider = contract.fromArtifact(eContractid.LendingPoolAddressesProvider);
let LendingPoolAddressesProviderRegistry = contract.fromArtifact(
  eContractid.LendingPoolAddressesProviderRegistry
);

let ReserveLogic = contract.fromArtifact(eContractid.ReserveLogic);
let GenericLogic = contract.fromArtifact(eContractid.GenericLogic);
let ValidationLogic = contract.fromArtifact(eContractid.ValidationLogic);
let LendingPool = contract.fromArtifact(eContractid.LendingPool);

let LendingPoolConfigurator = contract.fromArtifact(eContractid.LendingPoolConfigurator);

let StringLib = contract.fromArtifact('StringLib');

let StableAndVariableTokensHelper = contract.fromArtifact(
  eContractid.StableAndVariableTokensHelper
);

let ATokensAndRatesHelper = contract.fromArtifact(eContractid.ATokensAndRatesHelper);

let MintableERC20 = contract.fromArtifact(eContractid.MintableERC20);

let PriceOracle = contract.fromArtifact(eContractid.PriceOracle);
let MockAggregator = contract.fromArtifact(eContractid.MockAggregator);
let AaveOracle = contract.fromArtifact(eContractid.AaveOracle);

let WETH9Mocked = contract.fromArtifact(eContractid.WETH9Mocked);
let LendingRateOracle = contract.fromArtifact(eContractid.LendingRateOracle);

let AaveProtocolDataProvider = contract.fromArtifact(eContractid.AaveProtocolDataProvider);

let IncentivesController = contract.fromArtifact('IncentivesController');

let StableDebtToken = contract.fromArtifact('StableDebtToken');
let VariableDebtToken = contract.fromArtifact('VariableDebtToken');

let AToken = contract.fromArtifact('AToken');
let DelegationAwareAToken = contract.fromArtifact('DelegationAwareAToken');
let DefaultReserveInterestRateStrategy = contract.fromArtifact(
  'DefaultReserveInterestRateStrategy'
);

let LendingPoolCollateralManager = contract.fromArtifact('LendingPoolCollateralManager');
let MockFlashLoanReceiver = contract.fromArtifact('MockFlashLoanReceiver');
let WalletBalanceProvider = contract.fromArtifact('WalletBalanceProvider');
let WETHGateway = contract.fromArtifact('WETHGateway');

let sender = defaultSender;

let percentToRay = (ratePercent) => {
  let rateStr = ratePercent.replace('%', '');
  return web3.utils.toWei(rateStr, 'mether'); // 1e25
};

let timeTravel = async (seconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

let usdDecimalBN = new BN(10).pow(new BN(6));
let ethDecimalBN = new BN(10).pow(new BN(18));
let rayDecimalBN = new BN(10).pow(new BN(27));

let eth16BN = new BN(10).pow(new BN(16));

let oneHundredBN = new BN(100);

const [alice, bob, liquid] = accounts;
let getTokenInfo = async (erc20Token) => {
  let symbol = await erc20Token.symbol();
  let name = await erc20Token.name();
  let address = erc20Token.address;
  let decimals = await erc20Token.decimals();
  let decimalsPow = new BN(10).pow(decimals);

  return { symbol, name, address, decimals, decimalsPow };
};

const MockUsdPriceInWei = new BN('1000').mul(ethDecimalBN);
describe('AAVE V2 depoly ', function () {
  before(async () => {
    //1_mock_tokens
    for (const tokenSymbol of Object.keys(TokenContractId)) {
      let decimals = '18';
      if (tokenSymbol == 'WBTC') decimals = '8';
      if (tokenSymbol == 'USDT' || tokenSymbol == 'USDC') decimals = '6';
      if (tokenSymbol == 'GUSD') decimals = '2';
      this[tokenSymbol] = await MintableERC20.new(tokenSymbol, tokenSymbol, decimals);
      this[tokenSymbol].mint(MockUsdPriceInWei.mul(new BN('10000')));
      this[tokenSymbol].mint(MockUsdPriceInWei.mul(new BN('10000')), { from: alice });
      this[tokenSymbol].mint(MockUsdPriceInWei.mul(new BN('10000')), { from: bob });
    }

    //2_address_provider_registry---------
    let marketId = 'Aave';
    let addressesProvider = await LendingPoolAddressProvider.new(marketId);
    await addressesProvider.setPoolAdmin(sender);
    // await addressProvider.setPoolAdmin(aTokensAndRatesHelper.address)

    let addressesProviderRegistry = await LendingPoolAddressesProviderRegistry.new();
    await addressesProviderRegistry.registerAddressesProvider(addressesProvider.address, 1);

    //3_lending_pool----------
    const reserveLogic = await ReserveLogic.new();
    await GenericLogic.detectNetwork();
    await GenericLogic.link('ReserveLogic', reserveLogic.address);
    const genericLogic = await GenericLogic.new();
    await ValidationLogic.detectNetwork();
    await ValidationLogic.link('ReserveLogic', reserveLogic.address);
    await ValidationLogic.link('GenericLogic', genericLogic.address);
    const validationLogic = await ValidationLogic.new();

    await LendingPool.detectNetwork();
    await LendingPool.link('ValidationLogic', validationLogic.address);
    await LendingPool.link('ReserveLogic', reserveLogic.address);

    const lendingPoolImpl = await LendingPool.new();
    // Set lending pool impl to Address Provider
    await addressesProvider.setLendingPoolImpl(lendingPoolImpl.address);
    const lpAddress = await addressesProvider.getLendingPool();

    this.lpContractProxy = await LendingPool.at(lpAddress);

    const lendingPoolConfiguratorImpl = await LendingPoolConfigurator.new();
    // Set lending pool conf impl to Address Provider
    await addressesProvider.setLendingPoolConfiguratorImpl(lendingPoolConfiguratorImpl.address);
    let lpConfAddr = await addressesProvider.getLendingPoolConfigurator();
    this.lpConfiguratorProxy = await LendingPoolConfigurator.at(lpConfAddr);

    // this.lpConfiguratorProxy.initialize(addressesProvider.address)

    // const stringLib = await StringLib.new();
    // await StableAndVariableTokensHelper.detectNetwork();
    // await StableAndVariableTokensHelper.link('StringLib', stringLib.address);
    // Deploy deployment helpers
    const stableAndVariableTokensHelper = await StableAndVariableTokensHelper.new(
      lpAddress,
      addressesProvider.address
    );
    const aTokensAndRatesHelper = await ATokensAndRatesHelper.new(
      lpAddress,
      addressesProvider.address,
      lpConfAddr
    );

    //4_oracles---------
    const fallbackOracle = await PriceOracle.new();
    await addressesProvider.setPriceOracle(fallbackOracle.address);
    await fallbackOracle.setEthUsdPrice(MockUsdPriceInWei);

    const lendingRateOracle = await LendingRateOracle.new();
    await addressesProvider.setLendingRateOracle(lendingRateOracle.address);
    await lendingRateOracle.transferOwnership(stableAndVariableTokensHelper.address);

    let tokens = [],
      symbols = [],
      strategyRates = [],
      aggregators = [],
      rates = [];
    for (const tokenSymbol of Object.keys(TokenContractId)) {
      let mockToken = this[tokenSymbol];
      tokens.push(mockToken.address);
      symbols.push(tokenSymbol);
      strategyRates.push(RateParams);

      let price = ethDecimalBN;
      await fallbackOracle.setAssetPrice(mockToken.address, price);
      let mockAggr = await MockAggregator.new(price);
      aggregators.push(mockAggr.address);

      rates.push(percentToRay('10%'));
    }
    await stableAndVariableTokensHelper.setOracleBorrowRates(
      tokens,
      rates,
      lendingRateOracle.address
    );

    await stableAndVariableTokensHelper.setOracleOwnership(lendingRateOracle.address, sender);

    const weth = await WETH9Mocked.new();
    await AaveOracle.new(tokens, aggregators, fallbackOracle.address, weth.address);

    // 5_initialize
    const testHelpers = await AaveProtocolDataProvider.new(addressesProvider.address);

    let treasuryAddress = constants.ZERO_ADDRESS;
    let incentivesController = await IncentivesController.new();

    //StableDebtToken,VariableDebtToken
    let key = 0;
    for (const symbol of symbols) {
      // Deploy stable and variable deployers and save implementations ->await stableAndVariableTokensHelper.initDeployment(tokens, symbols, incentivesController.address)
      let stables = await StableDebtToken.new(
        lpAddress,
        tokens[key],
        'Aave variable debt bearing ' + symbol,
        symbol,
        incentivesController.address
      );
      let variables = await VariableDebtToken.new(
        lpAddress,
        tokens[key],
        'variableDebt ' + symbol,
        symbol,
        incentivesController.address
      );

      // Deploy atokens and rate strategies and save implementations - > aTokensAndRatesHelper.initDeployment(
      let aTokens = await AToken.new(
        lpAddress,
        tokens[key],
        treasuryAddress,
        'Aave interest bearing ' + symbol,
        'a' + symbol,
        incentivesController.address
      );
      let strategies = await DefaultReserveInterestRateStrategy.new(
        addressesProvider.address,
        ...strategyRates[key]
      );

      // Deploy delegated aware reserves tokens
      // let aTokens = await DelegationAwareAToken.new(lpAddress, tokens[key], treasuryAddress, "Aave interest bearing " + symbol, "a" + symbol, incentivesController.address);
      // this["a" + symbol] = aTokens;

      // Deploy init reserves per chunks  - >await aTokensAndRatesHelper.initReserve(
      let reserveDecimals = await this[symbol].decimals();
      let admin = await addressesProvider.getPoolAdmin();
      expect(admin).to.be.eq(sender, 'admin != sender');
      await this.lpConfiguratorProxy.initReserve(
        aTokens.address,
        stables.address,
        variables.address,
        reserveDecimals,
        strategies.address
      );
      let reserveData = await this.lpContractProxy.getReserveData(this[symbol].address);
      this['a' + symbol] = await AToken.at(reserveData.aTokenAddress);

      let configurator = this.lpConfiguratorProxy;
      let baseLTVs = '8000',
        liquidationThresholds = '8250',
        liquidationBonus = '10500';
      await configurator.configureReserveAsCollateral(
        tokens[key],
        baseLTVs,
        liquidationThresholds,
        liquidationBonus
      );
      let stableBorrowRateEnabled = true;
      await configurator.enableBorrowingOnReserve(tokens[key], stableBorrowRateEnabled);
      let reserveFactor = '1000';
      await configurator.setReserveFactor(tokens[key], reserveFactor);

      key++;
    }
    //
    let collateralManager = await LendingPoolCollateralManager.new();
    await addressesProvider.setLendingPoolCollateralManager(collateralManager.address);
    await MockFlashLoanReceiver.new(addressesProvider.address);
    await WalletBalanceProvider.new();
    await WETHGateway.new(weth.address, lpAddress);
  });

  it('Sender Alice depoist DAI, AAVE 1000 ', async () => {
    this.timeout(50000);
    const allowAmount = new BN('1000').mul(ethDecimalBN);
    let aDAI = this.aDAI;
    await this.DAI.approve(this.lpContractProxy.address, allowAmount);
    await this.DAI.approve(this.lpContractProxy.address, allowAmount, { from: bob });
    await this.AAVE.approve(this.lpContractProxy.address, allowAmount, { from: alice });

    let aTokenBal1 = await aDAI.scaledBalanceOf(sender);
    await this.lpContractProxy.deposit(this.DAI.address, allowAmount, sender, 0);
    //  await this.lpContractProxy.deposit(this.DAI.address, allowAmount, bob, 0,);
    await this.lpContractProxy.deposit(this.AAVE.address, allowAmount, alice, 0, { from: alice });

    let aTokenBal2 = await aDAI.scaledBalanceOf(sender);
    expect(aTokenBal2).to.be.bignumber.eq(aTokenBal1.add(allowAmount), 'depoist DAI fail');
  }).timeout(500000);

  it('Sender withdraw DAI  100 ', async () => {
    this.timeout(50000);
    const allowAmount = new BN('100').mul(ethDecimalBN);
    let aDAI = this.aDAI;
    let aTokenBal1 = await aDAI.scaledBalanceOf(sender);
    let tx = await this.lpContractProxy.withdraw(this.DAI.address, allowAmount, sender);
    let aTokenBal2 = await aDAI.scaledBalanceOf(sender);
    expect(aTokenBal2).to.be.bignumber.eq(aTokenBal1.sub(allowAmount), 'withdraw DAI fail');
  }).timeout(500000);

  it('Alice borrow DAI  100 ', async () => {
    this.timeout(50000);
    const allowAmount = new BN('100').mul(ethDecimalBN);
    let aTokenBal1 = await this.DAI.balanceOf(alice);
    await this.lpContractProxy.borrow(this.DAI.address, allowAmount, 2, 0, alice, { from: alice });
    let aTokenBal2 = await this.DAI.balanceOf(alice);
    expect(aTokenBal2).to.be.bignumber.eq(aTokenBal1.add(allowAmount), 'withdraw DAI fail');
  }).timeout(500000);

  it('Alice repay DAI  10 ', async () => {
    this.timeout(50000);
    const allowAmount = new BN('10').mul(ethDecimalBN);

    await this.DAI.approve(this.lpContractProxy.address, allowAmount, { from: alice });
    let aTokenBal1 = await this.DAI.balanceOf(alice);
    await this.lpContractProxy.repay(this.DAI.address, allowAmount, 2, alice, { from: alice });
    let aTokenBal2 = await this.DAI.balanceOf(alice);
    expect(aTokenBal2).to.be.bignumber.eq(aTokenBal1.sub(allowAmount), 'repay DAI fail');
  }).timeout(500000);

  it.skip('DAI Info', async () => {
    this.timeout(50000);
    const allowAmount = new BN('100').mul(ethDecimalBN);
    let _token = await getTokenInfo(this.DAI);
    let reserveData = await this.lpContractProxy.getReserveData(this.DAI.address);
    // console.log(reserveData.configuration.toString());
  }).timeout(500000);
});
