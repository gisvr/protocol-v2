let nodeProvider = require('../../utils/ganache.provider');

// const BN = require('bignumber.js');
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

let toDecimal = (_num, _decimal) => {
  let decimal = new BN(10).pow(new BN(_decimal));
  // console.log(_decimal.toFixed(),_decimal.toFixed().length)
  return new BN(_num).div(decimal);
};

let rayToPercent = (_rayStr) => {
  let rateStr = toDecimal(_rayStr, 25);
  return (BN(rateStr).toNumber() / 100).toFixed(2, 1) + '%';
};

let web3, sender, alice, bob;

describe('AAVE V2 Data ', function () {
  before(async () => {
    let provider = await nodeProvider.getAaveV2('LendingPoolAddressesProvider');
    let lpAddr = await provider.getLendingPool();
    this.lpContractProxy = await nodeProvider.getAaveV2('LendingPool', lpAddr);
    let reserves = await this.lpContractProxy.getReservesList();
    for (let addr of reserves) {
      let erc20Token = await nodeProvider.getAaveV2('MintableERC20', addr);
      let symbol = await erc20Token.symbol();
      this[symbol] = erc20Token;
    }

    //创建一个依赖测试节点的 arp
    let apiDataProvider = await nodeProvider.getAaveV2('ApiDataProvider');
    this.WETHGateway = await nodeProvider.getAaveV2('WETHGateway');

    this.ApiDataProvider = await apiDataProvider.new(provider.address, this.WETHGateway);

    web3 = await nodeProvider.getWeb3();
    accounts = await nodeProvider.getAccounts();
    [sender, alice, bob] = accounts;
  });

  it('DAI getUserAccountData', async () => {
    this.timeout(50000);

    let user = alice,
      userName = 'alice';
    let userAccountData = await this.ApiDataProvider.getUserAccountData(user);

    let healthFactorStr = userAccountData.healthFactor.toString();
    // userAccountData.totalBorrowsETH.eq(new BN(0))
    let healthFactor =
      healthFactorStr.length > 30
        ? 'no borrow'
        : userAccountData.healthFactor.div(ethDecimalBN).toString();

    console.log(
      `%s User AccountData (ETH)
    totalLiquidityETH %s, totalCollateralETH %s  totalBorrowsETH %s   availableBorrowsETH %s
    currentLiquidationThreshold %s  ltv %s  healthFactor %s `,
      userName,
      userAccountData.totalLiquidityETH.div(ethDecimalBN).toString(),
      userAccountData.totalCollateralETH.div(ethDecimalBN).toString(),
      userAccountData.totalBorrowsETH.div(ethDecimalBN).toString(),
      userAccountData.availableBorrowsETH.div(ethDecimalBN).toString(),
      userAccountData.currentLiquidationThreshold.toString(),
      userAccountData.ltv.toString(),
      healthFactor
    );
  }).timeout(500000);

  it('DAI getUserReserveData', async () => {
    this.timeout(50000);
    let user = alice,
      userName = 'alice';
    let _token = await getTokenInfo(this.DAI);
    let userReserve = await this.ApiDataProvider.getUserReserveData(_token.address, user);

    console.log(
      `%s %s User Reserve Data   Decimals(%s) 
    currentATokenBalance %s  currentBorrowBalance %s   principalBorrowBalance %s
    variableBorrowRate %s,  stableBorrowRate %s, liquidityRate %s  usageAsCollateralEnabled %s `,
      userName,
      _token.symbol,
      _token.decimals.toString(),
      userReserve.currentATokenBalance.div(_token.decimalsPow).toString(),
      userReserve.currentBorrowBalance.div(_token.decimalsPow).toString(),
      userReserve.principalBorrowBalance.div(_token.decimalsPow).toString(),
      rayToPercent(userReserve.variableBorrowRate).toString(),
      rayToPercent(userReserve.stableBorrowRate).toString(),
      rayToPercent(userReserve.liquidityRate).toString(),
      userReserve.usageAsCollateralEnabled.toString()
    );
  }).timeout(500000);
});
