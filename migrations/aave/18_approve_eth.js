// const { artifacts } = require("hardhat");

const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const LendingPoolAddressProvider = artifacts.require('LendingPoolAddressesProvider');
const LendingPool = artifacts.require('LendingPool');

const WETHGateway = artifacts.require('WETHGateway');

const WETH9Mocked = artifacts.require('WETH9Mocked');

// let nodeProvider = require("../../utils/ganache.provider");

let BN = web3.utils.BN;

let depoistToken = async (ethGateWay, account, mintTotal) => {
  let depositAmount = mintTotal.div(new BN(1000));

  await ethGateWay.depositETH(account, 0, { from: account, value: depositAmount });
};

let withdrawToken = async (ethGateWay, account, mintTotal) => {
  let withdrawAmount = mintTotal.div(new BN(4000));
  await ethGateWay.withdrawETH(withdrawAmount, account, { from: account });
};

let borrowVariable = async (ethGateWay, account, mintTotal) => {
  let borrowAmount = mintTotal.div(new BN(4000));
  await ethGateWay.borrowETH(borrowAmount, 2, 0, { from: account });
};

let borrowStable = async (ethGateWay, account, mintTotal) => {
  let borrowAmount = mintTotal.div(new BN(4000));
  await ethGateWay.borrowETH(borrowAmount, 1, 0, account, { from: account });
};

let repayVariable = async (ethGateWay, account, mintTotal) => {
  let amount = mintTotal.div(new BN(10000));
  await ethGateWay.repayETH(amount, 2, account, { from: account });
};

let repayStable = async (ethGateWay, account, mintTotal) => {
  let amount = mintTotal.div(new BN(10000));
  await ethGateWay.repayETH(amount, 1, account, { from: account });
};

module.exports = async (deployer, network, accounts) => {
  let lpProviderContract = await LendingPoolAddressProvider.deployed();

  let ethDecimalBN = new BN(10).pow(new BN(18));
  let [sender, alice, bob, liquid] = accounts;
  // let sender = deployer.networks[network].from;

  let lpAddr = await lpProviderContract.getLendingPool();
  let lpContract = await LendingPool.at(lpAddr);
  const weth = await WETH9Mocked.deployed();

  let wETHGateway = await WETHGateway.deployed();

  let wETHAddr = await wETHGateway.getWETHAddress();

  if (wETHAddr != weth.address) {
    console.error(wETHAddr, weth.address);
    console.error('wETHGateway getWETHAddress error');
    return;
  }

  let wETHLpAddr = await wETHGateway.getLendingPoolAddress();
  if (wETHLpAddr != lpAddr) {
    console.error('wETHGateway.getLendingPoolAddress error');
    return;
  }

  let senderBal1 = await web3.eth.getBalance(sender);

  console.log(senderBal1);
  let aliceBal1 = await web3.eth.getBalance(alice);
  console.log(
    'After ETH (18) %s sender bal %s alice bal %s',
    weth.address,
    new BN(senderBal1).div(ethDecimalBN).toString(),
    new BN(aliceBal1).div(ethDecimalBN).toString()
  );

  let mintTotal = new BN(senderBal1);

  await depoistToken(wETHGateway, sender, mintTotal);

  await depoistToken(wETHGateway, alice, mintTotal);

  await withdrawToken(wETHGateway, sender, mintTotal);

  await borrowStable(wETHGateway, alice, mintTotal);

  await borrowVariable(wETHGateway, alice, mintTotal);

  await repayVariable(wETHGateway, alice, mintTotal);

  await repayStable(wETHGateway, alice, mintTotal);

  let senderBal2 = await web3.eth.getBalance(sender);
  let aliceBal2 = await web3.eth.getBalance(alice);
  console.log(
    'Befor ETH (18) %s sender bal %s alice bal %s',
    weth.address,
    new BN(senderBal2).div(ethDecimalBN).toString(),
    new BN(aliceBal2).div(ethDecimalBN).toString()
  );
};
