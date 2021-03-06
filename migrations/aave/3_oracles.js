// ============ Contracts ============

let config = require('../../config');
let conf = config[config.network].aaveV2;

const LendingPoolAddressProvider = artifacts.require('LendingPoolAddressesProvider');

const PriceOracle = artifacts.require('PriceOracle');

const MockAggregator = artifacts.require('MockAggregator');
const WETH9Mocked = artifacts.require('WETH9Mocked');

const MintableERC20 = artifacts.require('MintableERC20');
const AaveOracle = artifacts.require('AaveOracle');
const LendingRateOracle = artifacts.require('LendingRateOracle');
const StableAndVariableTokensHelper = artifacts.require('StableAndVariableTokensHelper');

let BN = web3.utils.BN;
let ethDecimalBN = new BN(10).pow(new BN(18));

const MockUsdPriceInWei = new BN('1000').mul(ethDecimalBN);

module.exports = async (deployer, network, accounts) => {
  let [sender, alice, bob] = accounts;

  const weth = await WETH9Mocked.deployed();

  let tokenList = conf.tokenList;
  global.tokenList = tokenList;
  //1_mock_tokens
  for (const token of tokenList) {
    let tokenSymbol = token.symbol;
    let decimals = token.decimals;
    if (token.address) {
      this[tokenSymbol] = token.obj = await MintableERC20.at(token.address);
      let symbol = await token.obj.symbol();

      if (tokenSymbol != symbol) throw 'Mock token error!';
    } else {
      await deployer.deploy(MintableERC20, tokenSymbol, tokenSymbol, decimals);
      this[tokenSymbol] = token.obj = await MintableERC20.deployed();

      let mintTotal = new BN(10).pow(new BN(decimals));
      mintTotal = mintTotal.mul(new BN(1e7));
      this[tokenSymbol].mint(mintTotal, { from: sender });
      this[tokenSymbol].mint(mintTotal, { from: alice });
      this[tokenSymbol].mint(mintTotal, { from: bob });

      // console.log(tokenSymbol, decimals, token.obj.address,mintTotal.toString());
    }
  }

  // console.log(await this.DAI.name())
  let addressesProvider = await LendingPoolAddressProvider.deployed();
  const lpAddress = await addressesProvider.getLendingPool();
  await deployer.deploy(StableAndVariableTokensHelper, lpAddress, addressesProvider.address);
  const stableAndVariableTokensHelper = await StableAndVariableTokensHelper.deployed();

  //4_oracles---------
  await deployer.deploy(PriceOracle);
  let fallbackOracle = await PriceOracle.deployed();
  await addressesProvider.setPriceOracle(fallbackOracle.address);

  await fallbackOracle.setEthUsdPrice(MockUsdPriceInWei);

  await deployer.deploy(LendingRateOracle);
  const lendingRateOracle = await LendingRateOracle.deployed();
  await addressesProvider.setLendingRateOracle(lendingRateOracle.address);
  await lendingRateOracle.transferOwnership(stableAndVariableTokensHelper.address);

  let tokens = [],
    symbols = [],
    strategyRates = [],
    aggregators = [],
    rates = [];
  for (const token of tokenList) {
    let tokenSymbol = token.symbol;
    let mockToken = this[tokenSymbol];

    tokens.push(mockToken.address);
    symbols.push(tokenSymbol);
    strategyRates.push(token.strategy);
    rates.push(token.borrow.marketBorrowRate);

    let price = token.priceEth;
    await fallbackOracle.setAssetPrice(mockToken.address, price);
    await deployer.deploy(MockAggregator, price);
    let mockAggr = await MockAggregator.deployed();
    aggregators.push(mockAggr.address);
  }

  await stableAndVariableTokensHelper.setOracleBorrowRates(
    tokens,
    rates,
    lendingRateOracle.address
  );

  await stableAndVariableTokensHelper.setOracleOwnership(lendingRateOracle.address, sender);

  await deployer.deploy(AaveOracle, tokens, aggregators, fallbackOracle.address, weth.address);
};
