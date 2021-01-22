let nodeProvider = require('../../utils/ganache.provider');
const {
  BN,
  time, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const { tracker } = require('@openzeppelin/test-helpers/src/balance');

const { expect } = require('chai');
let ethDecimalBN = new BN(10).pow(new BN(18));

// const [alice, bob, liquid] = accounts;
let getTokenInfo = async (erc20Token) => {
  let symbol = await erc20Token.symbol();
  let name = await erc20Token.name();
  let address = erc20Token.address;
  let decimals = await erc20Token.decimals();
  let decimalsPow = new BN(10).pow(decimals);
  return { symbol, name, address, decimals, decimalsPow };
};

let web3;

describe('AAVE V2 Reserve Data ', function () {
  before(async () => {
    let provider = await nodeProvider.getAaveV2('LendingPoolAddressesProvider');
    let lpAddr = await provider.getLendingPool();
    this.lpContractProxy = await nodeProvider.getAaveV2('LendingPool', lpAddr);

    let aTokensAndRatesHelper = await nodeProvider.getAaveV2('ATokensAndRatesHelper');

    let tokens = ['0xC243F145eD102CFc4b7dEB67b5095a64b6146009'];
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
  });

  it('DAI API getReservesList', async () => {
    let reserves = await this.lpContractProxy.getReservesList();
    console.log(reserves);
    //
  });
});
