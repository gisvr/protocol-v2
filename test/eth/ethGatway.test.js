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

let web3, accounts;

let getFees = async (res) => {
  let tx1 = await web3.eth.getTransaction(res.tx);
  return new BN(res.receipt.gasUsed).mul(new BN(tx1.gasPrice));
};

let sendEther = async (web3Obj, to, value) => {
  let from = web3Obj.eth.defaultAccount;
  let nonce = await web3.eth.getTransactionCount(from);
  // nonce = nonce+1;
  let gas = 3e4;
  let sendEth = { from, to, value, gas, nonce };
  return web3Obj.eth.sendTransaction(sendEth);
};

let interestType = {
  stable: 1,
  variable: 2,
};

describe('AAVE V2 ETH ', function () {
  before(async () => {
    this.WETH = await nodeProvider.getAaveV2('WETH9Mocked');
    let wEthGateway = await nodeProvider.getAaveV2('WETHGateway');

    let lpAddr = await wEthGateway.getLendingPoolAddress();
    this.lpContractProxy = await nodeProvider.getAaveV2('LendingPool', lpAddr);

    let wethAddr = await wEthGateway.getWETHAddress();
    let reserve = await this.lpContractProxy.getReserveData(wethAddr);

    // console.log(`atoken %s stableDebt %s variableDet %s`, reserve.aTokenAddress, reserve.stableDebtTokenAddress, reserve.variableDebtTokenAddress);

    this.aWETH = await nodeProvider.getAaveV2('AToken', reserve.aTokenAddress);
    this.stableDebtToken = await nodeProvider.getAaveV2(
      'DebtTokenBase',
      reserve.stableDebtTokenAddress
    );
    this.variableDebtToken = await nodeProvider.getAaveV2(
      'DebtTokenBase',
      reserve.variableDebtTokenAddress
    );

    this.wEthGateway = wEthGateway;

    accounts = nodeProvider.getAccounts();
    web3 = nodeProvider.getWeb3();
  });

  it('depositETH', async () => {
    let [alice, bob] = accounts;

    let bal = new BN(2).mul(ethDecimalBN);
    let aliceBal1 = await web3.eth.getBalance(alice);
    let ethGateWay = this.wEthGateway;
    let res = await ethGateWay.depositETH(alice, 0, { from: alice, value: bal });

    let fee = await getFees(res);
    let aliceBal2 = await web3.eth.getBalance(alice);

    expect(aliceBal1).to.be.bignumber.eq(
      new BN(aliceBal2).add(bal).add(fee),
      'deposit ETH bal not correct'
    );
  });

  it.skip('borrowETH  approve delegation', async () => {
    let alice = accounts[4];

    let aliceBal1 = await web3.eth.getBalance(alice);
    if (new BN(aliceBal1).lt(ethDecimalBN)) {
      await sendEther(web3, alice, ethDecimalBN);
    }
    aliceBal1 = await web3.eth.getBalance(alice);
    console.log(new BN(aliceBal1).div(ethDecimalBN).toString());
    let ethGateWay = this.wEthGateway;
    let borrowType = interestType.variable;
    let bal = new BN(10).mul(ethDecimalBN);

    let res = await ethGateWay.depositETH(alice, 0, { from: alice, value: ethDecimalBN });

    let accountData = this.lpContractProxy.getUserAccountData(alice);

    let res1 =
      borrowType == interestType.stable
        ? await this.stableDebtToken.approveDelegation(ethGateWay.address, bal, { from: alice })
        : await this.variableDebtToken.approveDelegation(ethGateWay.address, bal, { from: alice });

    let res2 = await ethGateWay.borrowETH(bal, borrowType, 0, { from: alice });
    let aliceBal2 = await web3.eth.getBalance(alice);
    console.log(aliceBal2);
  });

  it('borrowETH repayETH variable', async () => {
    let [alice] = accounts;
    let ethGateWay = this.wEthGateway;

    let borrowType = interestType.variable;

    let bal = new BN(1).mul(ethDecimalBN);

    let aliceBal1 = await web3.eth.getBalance(alice);

    let res1 =
      borrowType == interestType.stable
        ? await this.stableDebtToken.approveDelegation(ethGateWay.address, bal, { from: alice })
        : await this.variableDebtToken.approveDelegation(ethGateWay.address, bal, { from: alice });

    let fee1 = await getFees(res1);

    // stable intrest
    let res2 = await ethGateWay.borrowETH(bal, borrowType, 0, { from: alice });
    let fee2 = await getFees(res2);
    let aliceBal2 = await web3.eth.getBalance(alice);

    expect(aliceBal1).to.be.bignumber.eq(
      new BN(aliceBal2).add(fee1).add(fee2).sub(bal),
      'borrowETH bal not correct '
    );

    let res3 = await ethGateWay.repayETH(bal, borrowType, alice, { from: alice, value: bal });

    let fee3 = await getFees(res3);
    let aliceBal3 = await web3.eth.getBalance(alice);

    expect(aliceBal3).to.be.bignumber.eq(
      new BN(aliceBal2).sub(fee3).sub(bal),
      'repayETH bal not correct '
    );
  });

  it('withdrawETH', async () => {
    let [alice, bob] = accounts;
    let bal = new BN(2).mul(ethDecimalBN);
    let ethGateWay = this.wEthGateway;

    let aliceBal1 = await web3.eth.getBalance(alice);

    let aTokenBal = await this.aWETH.balanceOf(alice);
    expect(aTokenBal).to.be.bignumber.gte(bal, 'eth atoken bal must lte withdraw bal');

    let res1 = await this.aWETH.approve(ethGateWay.address, bal, { from: alice });

    // approve fee
    let fee1 = await getFees(res1);
    let aliceBal2 = await web3.eth.getBalance(alice);
    expect(aliceBal2).to.be.bignumber.eq(new BN(aliceBal1).sub(fee1), 'approve fee not equal');

    let res2 = await ethGateWay.withdrawETH(bal, alice, { from: alice });
    // withdraw fee
    let fee2 = await getFees(res2);
    let aliceBal3 = await web3.eth.getBalance(alice);
    expect(aliceBal3).to.be.bignumber.eq(
      new BN(aliceBal2).sub(fee2).add(bal),
      'withdarw bal not correct '
    );
  });
});
