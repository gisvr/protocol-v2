// const { artifacts } = require("hardhat");

const LendingPoolAddressProvider = artifacts.require('LendingPoolAddressesProvider');
const LendingPool = artifacts.require('LendingPool');

const WETHGateway = artifacts.require('WETHGateway');
const ApiDataProvider = artifacts.require('ApiDataProvider');

// let nodeProvider = require("../../utils/ganache.provider");

let BN = web3.utils.BN;

let depoistToken = async (erc20Token, lpContract, account, mintTotal) => {
  let depositAmount = mintTotal.div(new BN(100));

  await lpContract.deposit(erc20Token.address, depositAmount, account, 0, { from: account });
};

let withdrawToken = async (erc20Token, lpContract, account, mintTotal) => {
  let amount = mintTotal.div(new BN(400));
  await lpContract.withdraw(erc20Token.address, amount, account, { from: account });
};

let borrowToken = async (erc20Token, lpContract, account, mintTotal) => {
  let borrowAmount = mintTotal.div(new BN(200));
  await lpContract.borrow(erc20Token.address, borrowAmount, 2, 0, account, { from: account });
};

let repayToken = async (erc20Token, lpContract, account, mintTotal) => {
  let amount = mintTotal.div(new BN(10000));
  await lpContract.repay(erc20Token.address, amount, 2, account, { from: account });
};

module.exports = async (deployer, network, accounts) => {
  let lpProviderContract = await LendingPoolAddressProvider.deployed();

  let ethDecimalBN = new BN(10).pow(new BN(18));
  let [sender, alice, bob, liquid] = accounts;
  // let sender = deployer.networks[network].from;

  let lpAddr = await lpProviderContract.getLendingPool();
  let lpCoreAddr = lpAddr;
  let lpContract = await LendingPool.at(lpAddr);

  let wETHGateway = await WETHGateway.deployed();

  let depositAmount = new BN(1).mul(ethDecimalBN);
  // await depoistEth(lpContract,depositAmount,bob)

  let tokenList = global.tokenList;
  for (let token of tokenList) {
    let erc20Token = token.obj;
    let symbol = await erc20Token.symbol();
    let reserveAddr = erc20Token.address;
    let decimals = await erc20Token.decimals();
    let reserveDecimals = new BN(10).pow(decimals);

    let mintTotal = await erc20Token.balanceOf(sender);
    await erc20Token.approve(lpCoreAddr, mintTotal, { from: sender });
    await erc20Token.approve(lpCoreAddr, mintTotal, { from: alice });

    // console.log(symbol,mintTotal.div(reserveDecimals).toString(),erc20Token.address,lpContract.address)
    await depoistToken(erc20Token, lpContract, sender, mintTotal);
    // borrow need collateral balance
    await depoistToken(erc20Token, lpContract, alice, mintTotal);
    await withdrawToken(erc20Token, lpContract, sender, mintTotal);

    await borrowToken(erc20Token, lpContract, alice, mintTotal);

    await repayToken(erc20Token, lpContract, alice, mintTotal);

    let bal1 = await erc20Token.balanceOf(sender);
    let bal2 = await erc20Token.balanceOf(alice);
    console.log(
      '%s (%s) %s sender bal %s alice bal %s',
      token.symbol,
      decimals.toString(),
      reserveAddr,
      bal1.div(reserveDecimals).toString(),
      bal2.div(reserveDecimals).toString()
    );
  }

  await deployer.deploy(ApiDataProvider, lpProviderContract.address, wETHGateway.address);

  let apiDataProvider = await ApiDataProvider.deployed();

  console.log('ApiDataProvider', apiDataProvider.address);

  console.log('LendingPoolAddressProvider', lpProviderContract.address);
};
