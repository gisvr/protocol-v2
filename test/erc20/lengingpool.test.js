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
      console.log(symbol, erc20Token.address);
    }

    //创建一个依赖测试节点的 arp
    let apiDataProvider = await nodeProvider.getAaveV2('ApiDataProvider');
    this.WETHGateway = await nodeProvider.getAaveV2('WETHGateway');

    // this.ApiDataProvider = await apiDataProvider.new(provider.address, this.WETHGateway);

    web3 = await nodeProvider.getWeb3();
    accounts = await nodeProvider.getAccounts();
    [sender, alice, bob] = accounts;
    console.log(accounts);

    console.log(lpAddr);
  });

  it.skip('deposit withdraw', async () => {
    this.timeout(50000);
    let erc20Token = this.DAI;
    let lpCoreAddr = this.lpContractProxy.address;
    // let mintTotal = await erc20Token.balanceOf(sender);
    let amount = ethDecimalBN;
    let account = sender;
    await erc20Token.approve(lpCoreAddr, amount, { from: account });

    let res1 = await this.lpContractProxy.deposit(erc20Token.address, amount, account, 0, {
      from: account,
    });
    console.log(res1.tx);
    let res2 = await this.lpContractProxy.withdraw(erc20Token.address, amount, account, {
      from: account,
    });

    console.log(res2.tx);
  }).timeout(500000);

  it('only withdraw', async () => {
    this.timeout(50000);
    let erc20Token = this.DAI;
    let tokenUSDC = this.USDC;
    let lpAddr = this.lpContractProxy.address;
    // let mintTotal = await erc20Token.balanceOf(sender);
    let amount = ethDecimalBN.mul(new BN(2));
    let account = '0x0271d4a9191c8277632ff0494de8fabb364f93d5';

    let reserve = await this.lpContractProxy.getReserveData(this.DAI.address);

    let lpBal = await erc20Token.balanceOf(reserve.aTokenAddress);

    console.log('atoken balance ', lpBal.div(ethDecimalBN).toString());

    let aDAI = await nodeProvider.getAaveV2('AToken', reserve.aTokenAddress);

    let aTokenBal = await aDAI.scaledBalanceOf(account);
    console.log(aTokenBal.div(ethDecimalBN).toString());

    aTokenBal = await aDAI.balanceOf(account);
    console.log(aTokenBal.div(ethDecimalBN).toString());

    // await aDAI.approve(lpAddr, amount.mul(new BN(20)), { from: account });
    // let allowance = await aDAI.allowance(account, lpAddr);
    // console.log("allowance", allowance.div(ethDecimalBN).toString())

    let accountData = await this.lpContractProxy.getUserAccountData(account); //

    let health = accountData.healthFactor.div(ethDecimalBN);
    console.log(
      'healthFactor %s, %s availableBorrowsETH %s %s',
      health.toString(),
      accountData.healthFactor.toString(),
      accountData.availableBorrowsETH.div(ethDecimalBN).toString(),
      accountData.availableBorrowsETH.toString()
    );

    // await erc20Token.approve(lpAddr, amount, { from: account });

    // await this.lpContractProxy.deposit(erc20Token.address, amount, account, 0, { from: account });

    if (health.toString() == '1') {
      // let usdcBal = await tokenUSDC.balanceOf(account);
      // let usdcAmount = new BN(600e6);
      // console.log("USDC", usdcBal.toString(), tokenUSDC.address)
      // await tokenUSDC.approve(lpAddr, usdcAmount, { from: account });
      // let res1 = await this.lpContractProxy.deposit(tokenUSDC.address, usdcAmount, account, 0, { from: account });
      // console.log("USDC", res1.tx);
    }

    let accountData2 = await this.lpContractProxy.getUserAccountData(account); //

    health = accountData2.healthFactor.div(ethDecimalBN);
    console.log(
      '2 healthFactor %s, %s availableBorrowsETH %s %s',
      health.toString(),
      accountData2.healthFactor.toString(),
      accountData2.availableBorrowsETH.div(ethDecimalBN).toString(),
      accountData2.availableBorrowsETH.toString()
    );

    console.log(erc20Token.address, amount.div(ethDecimalBN).toString(), account);
    let res2 = await this.lpContractProxy.withdraw(erc20Token.address, amount, account, {
      from: account,
    });
    console.log(res2.tx);
  }).timeout(500000);

  it.skip('withdraw', async () => {
    this.timeout(50000);
    let erc20Token = this.DAI;
    let lpCoreAddr = this.lpContractProxy.address;
    // let mintTotal = await erc20Token.balanceOf(sender);
    let amount = ethDecimalBN;
    let account = '0x0271d4a9191c8277632ff0494de8fabb364f93d5';

    let reserve = this.lpContractProxy.getReserveData(this.DAI.address);

    let aDAI = await nodeProvider.getAaveV2('AToken', reserve.aTokenAddress);

    await aDAI.approve(lpCoreAddr, amount, { from: account });

    let allowance = await aDAI.allowance(account, lpCoreAddr);
    console.log('aDAI allowance', allowance.toString(), allowance.div(ethDecimalBN).toString());

    // await this.lpContractProxy.deposit(erc20Token.address, amount, account, 0, { from: account });

    console.log(erc20Token.address, amount.toString(), account);

    let res = await this.lpContractProxy.withdraw(erc20Token.address, amount, account, {
      from: account,
    });
    console.log(res);
  }).timeout(500000);

  //   0x2d5Ed9bC72E93696D985ddB3684e5BAD6F9e1D11
  // 10000000000000000000
  // 0x0271d4a9191c8277632ff0494de8fabb364f93d5

  // 0x2d5Ed9bC72E93696D985ddB3684e5BAD6F9e1D11 1000000000000000000 0x0271d4a9191c8277632ff0494de8fabb364f93d5
});
