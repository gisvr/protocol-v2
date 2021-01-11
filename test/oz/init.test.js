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

const { eContractid, TokenContractId } = require('./base');
let LendingPoolAddressProvider = contract.fromArtifact(eContractid.LendingPoolAddressesProvider);
let LendingPoolAddressesProviderRegistry = contract.fromArtifact(
  eContractid.LendingPoolAddressesProviderRegistry
);

let ReserveLogic = contract.fromArtifact(eContractid.ReserveLogic);
let GenericLogic = contract.fromArtifact(eContractid.GenericLogic);
let ValidationLogic = contract.fromArtifact(eContractid.ValidationLogic);
let LendingPool = contract.fromArtifact(eContractid.LendingPool);

let LendingPoolConfigurator = contract.fromArtifact(eContractid.LendingPoolConfigurator);

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

//贷款及价值，清算阈值，清算惩罚
let ltv = '75',
  liquidationThreshold = '85',
  liquidationBonus = '105';
let ethUSD = '500';
let usdETH = '0.002'; //1美元对应的 ETH

let _receiveAToken = false;

let _purchaseAmount = new BN('179').mul(ethDecimalBN); //374 临界值

const [alice, bob, liquid] = accounts;

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
    }

    //2_address_provider_registry---------
    let marketId = 'Aave';
    let addressesProvider = await LendingPoolAddressProvider.new(marketId);
    await await addressesProvider.setPoolAdmin(sender);

    let addressesProviderRegistry = await LendingPoolAddressesProviderRegistry.new();
    await await addressesProviderRegistry.registerAddressesProvider(addressesProvider.address, 1);

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

    await await fallbackOracle.setEthUsdPrice(MockUsdPriceInWei);

    const lendingRateOracle = await LendingRateOracle.new();
    await addressesProvider.setLendingRateOracle(lendingRateOracle.address);

    await lendingRateOracle.transferOwnership(stableAndVariableTokensHelper.address);

    let tokens = [],
      aggregators = [],
      rates = [];
    for (const tokenSymbol of Object.keys(TokenContractId)) {
      let mockToken = this[tokenSymbol];
      tokens.push(mockToken.address);
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

    stableAndVariableTokensHelper.setOracleOwnership(lendingRateOracle.address, sender);

    const weth = await WETH9Mocked.new();
    await AaveOracle.new(tokens, aggregators, fallbackOracle.address, weth.address);

    // 5_initialize
    const testHelpers = await AaveProtocolDataProvider.new(addressesProvider.address);
    // initReservesByHelper -- strategy
    // await initReservesByHelper(
    //     reservesParams,
    //     protoPoolReservesAddresses,
    //     admin,
    //     treasuryAddress,
    //     ZERO_ADDRESS,
    //     verify
    //   );

    // export const initReservesByHelper = async (
    //     reservesParams: iMultiPoolsAssets<IReserveParams>,
    //     tokenAddresses: { [symbol: string]: tEthereumAddress },
    //     admin: tEthereumAddress,
    //     treasuryAddress: tEthereumAddress,
    //     incentivesController: tEthereumAddress,
    //     verify: boolean
    //   ): Promise<BigNumber> => {

    // export const configureReservesByHelper = async (
    //     reservesParams: iMultiPoolsAssets<IReserveParams>,
    //     tokenAddresses: { [symbol: string]: tEthereumAddress },
    //     helpers: AaveProtocolDataProvider,
    //     admin: tEthereumAddress
    //   )
  });

  it('DAI, BAT, TUSD alice,bob,sender depoist 1000 ', async () => {
    this.timeout(50000);
    console.log('KKK');
  }).timeout(500000);
});
