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
    // console.log(accounts);

    console.log('LendingPool:', lpAddr);
  });

  it.skip('web3 borrow repay', async () => {
    this.timeout(50000);
    let erc20Token = this.DAI;

    let reserveAddr = '0x5469248772D1A653a7174C08B9e8c73095d8dB58';
    let amount = '100000'; // (1e18).toString(); 1000000000
    let account = '0x0271d4a9191c8277632ff0494de8fabb364f93d5';
    // let res1 = await this.lpContractProxy.borrow(reserveAddr, amount, 2, 0, account, { from: account });
    // console.log("borrow reserve:%s amount:%s account:%s",reserveAddr,amount, account,res1.tx);

    let accountData = await this.lpContractProxy.web3Obj.methods.getUserAccountData(account).call();

    console.log('availableBorrowsETH', accountData.availableBorrowsETH);

    let res1 = await this.lpContractProxy.web3Obj.methods
      .borrow(reserveAddr, amount, 1, 0, account)
      .send({
        from: account,
      });

    console.log(res1.tx);

    let res2 = await this.lpContractProxy.repay(erc20Token.address, amount, 1, account, {
      from: account,
    });

    console.log('repay', res2.tx);
  }).timeout(500000);

  it('borrow repay', async () => {
    this.timeout(50000);
    let erc20Token = this.WBTC;

    let reserveAddr = '0xcc64931eD58b45be34b5C67d9E271D9Be4262694';
    let amount = '10000000';
    let account = '0x0271d4a9191c8277632ff0494de8fabb364f93d5';

    let reserve = await this.lpContractProxy.getReserveData(reserveAddr);

    let stableDebtToken = await nodeProvider.getAaveV2(
      'StableDebtToken',
      reserve.stableDebtTokenAddress
    );
    let variableDebtToken = await nodeProvider.getAaveV2(
      'VariableDebtToken',
      reserve.variableDebtTokenAddress
    );

    let stableDebt = await stableDebtToken.principalBalanceOf(account);
    let variableDebt = await variableDebtToken.scaledBalanceOf(account);

    console.log('stableDebt %s,variableDebt %s ', stableDebt.toString(), variableDebt.toString());

    let lpBal = await erc20Token.balanceOf(reserve.aTokenAddress);
    let userBal = await erc20Token.balanceOf(account);

    let decimals = await erc20Token.decimals();
    let symbol = await erc20Token.symbol();

    console.log(
      '%s Atoken balance %s User bal %s',
      symbol,
      lpBal.div(decimals).toString(),
      userBal.div(decimals).toString()
    );

    let accountData = await this.lpContractProxy.getUserAccountData(account); //

    let health = accountData.healthFactor.div(ethDecimalBN);
    console.log(
      'healthFactor %s, %s availableBorrowsETH %s %s',
      health.toString(),
      accountData.healthFactor.toString(),
      accountData.availableBorrowsETH.div(ethDecimalBN).toString(),
      accountData.availableBorrowsETH.toString()
    );

    let res1 = await this.lpContractProxy.borrow(reserveAddr, amount, 2, 0, account, {
      from: account,
    });
    console.log('borrow reserve:%s amount:%s account:%s', reserveAddr, amount, account);

    let res2 = await this.lpContractProxy.repay(erc20Token.address, amount, 1, account, {
      from: account,
    });

    console.log('repay', res2.tx);
  }).timeout(500000);

  // 0x617Cf35319854F29fEf0C6E918b2f174dbfd27FD
  // 10000000000000000000
  // 1
  // 0x0271d4a9191c8277632ff0494de8fabb364f93d5

  // 0xb5803eD31580c72A58C4ac9eAA9b91956DEBe6ad

  // 十六进制数据: 132 BYTES
  // 0x573ade81000000000000000000000000
  // cc64931ed58b45be34b5c67d9e271d9be4262694000000000000000000000000000000000000000000000000000000000
  // 5f56bd0000000000000000000000000000000000000000000000000000000000000000
  // 10000000000000000000000000
  // 271d4a9191c8277632ff0494de8fabb364f93d5
});
