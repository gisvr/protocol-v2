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
    let chainID = await nodeProvider.getChainId();
    let provider = await nodeProvider.getAaveV2('LendingPoolAddressesProvider');
    console.log(`ChainID %s ,LendingPoolAddressesProvider %s `, chainID, provider.address);

    let lpAddr = await provider.getLendingPool();

    // console.log(`LendingPoolAddressesProvider %s LendingPool %s `, provider.address, lpAddr);
    this.lpContractProxy = await nodeProvider.getAaveV2('LendingPool', lpAddr);
    let reserves = await this.lpContractProxy.getReservesList();
    this.tokenList = [];
    for (let addr of reserves) {
      let erc20Token = await nodeProvider.getAaveV2('MintableERC20', addr);
      let symbol = await erc20Token.symbol();
      let decimals = await erc20Token.decimals();
      console.log(symbol, decimals.toString(), erc20Token.address);
      this[symbol] = erc20Token;
      this.tokenList.push(erc20Token);
    }

    //创建一个依赖测试节点的 arp
    let apiDataProvider = await nodeProvider.getAaveV2('ApiDataProvider');
    this.WETHGateway = await nodeProvider.getAaveV2('WETHGateway');

    this.ApiDataProvider = await apiDataProvider.new(provider.address, this.WETHGateway.address);

    console.log(`ApiDataProvider %s `, this.ApiDataProvider.address);

    // web3 = await nodeProvider.getWeb3();
    // accounts = await nodeProvider.getAccounts();
    // [sender, alice, bob] = accounts;
  });

  it('DAI getUserAccountData', async () => {
    this.timeout(50000);

    let user = alice;

    for (let erc20Token of this.tokenList) {
      // let token = await getTokenInfo(erc20Token);
      // let depositAmount = token.decimalsPow.div(new BN(1));
      // await this.lpContractProxy.deposit(token.address, depositAmount, user, 0, { from: user });
    }
  }).timeout(500000);
});
