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
    this.ApiDataProvider = await apiDataProvider.new(provider.address, this.WETHGateway.address);

    console.log('Provider %s, ApiDataProvider %s', provider.address, this.ApiDataProvider.address);

    web3 = await nodeProvider.getWeb3();
  });

  it.skip('DAI API getReserveConfigurationData', async () => {
    let _token = await getTokenInfo(this.DAI);
    let reserveConfigData = await this.ApiDataProvider.getReserveConfigurationData(_token.address);
    console.log(
      `%s alice getReserveData  Decimals(%s) ltv %s liquidationThreshold %s liquidationBonus %s 
    usageAsCollateralEnabled %s borrowingEnabled %s stableBorrowRateEnabled %s isActive %s \n`,
      _token.symbol,
      _token.decimals.toString(),
      reserveConfigData.ltv.toString(),
      reserveConfigData.liquidationThreshold.toString(),
      reserveConfigData.liquidationBonus.toString(),
      reserveConfigData.usageAsCollateralEnabled,
      reserveConfigData.borrowingEnabled,
      reserveConfigData.stableBorrowRateEnabled,
      reserveConfigData.isActive
    );
  });

  it('DAI API getReserveData', async () => {
    this.timeout(50000);
    let _token = await getTokenInfo(this.DAI);
    let reserveData = await this.ApiDataProvider.getReserveData(_token.address);
    console.log(
      `%s Reserve Data Decimals(%s)  RAY
    liquidityRate %s 
    variableBorrowRate %s 
    stableBorrowRate %s
    liquidityIndex %s
    variableBorrowIndex %s `,
      _token.symbol,
      _token.decimals.toString(),
      reserveData.liquidityRate.toString(),
      reserveData.variableBorrowRate.toString(),
      reserveData.stableBorrowRate.toString(),
      reserveData.liquidityIndex.toString(),
      reserveData.variableBorrowIndex.toString()
    );
    console.log(`atoken ${reserveData.aTokenAddress} last time ${reserveData.lastUpdateTimestamp}`);
  }).timeout(500000);

  it('DAI API getMarket', async () => {
    this.timeout(50000);
    let _token = await getTokenInfo(this.DAI);
    let market = await this.ApiDataProvider.getMarket();

    for (let reserveData of market) {
      if (reserveData.aTokenAddress == constants.ZERO_ADDRESS) continue;
      console.log(
        `%s Reserve Data Decimals(%s)  RAY
          liquidityRate %s  variableBorrowRate %s  stableBorrowRate %s
          liquidityIndex %s variableBorrowIndex %s `,
        _token.symbol,
        _token.decimals.toString(),
        reserveData.currentLiquidityRate.toString(),
        reserveData.currentVariableBorrowRate.toString(),
        reserveData.currentStableBorrowRate.toString(),
        reserveData.liquidityIndex.toString(),
        reserveData.variableBorrowIndex.toString()
      );
      console.log(
        `atoken ${reserveData.aTokenAddress} last time ${reserveData.lastUpdateTimestamp}`
      );
    }
  }).timeout(500000);

  it('DAI V2 getReserveData', async () => {
    let _token = await getTokenInfo(this.DAI);
    let reserveData = await this.lpContractProxy.getReserveData(_token.address);

    console.log(reserveData.configuration.toString());
    let uint256Conf = web3.eth.abi.encodeParameter('uint256', reserveData.configuration.toString());
    console.log(uint256Conf);
  });

  it.skip('Get AAVE reserves', async () => {
    this.timeout(50000);
    let provider = await nodeProvider.getAave('LendingPoolAddressesProvider');
    let lpAddr = await provider.getLendingPool();
    let lp = await nodeProvider.getAave('LendingPool', lpAddr);
    let reserves = await lp.getReserves();
    for (let addr of reserves) {
      if (addr == '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') continue;
      let erc20Token = await nodeProvider.getAaveV2('MintableERC20', addr);
      let symbol = await erc20Token.symbol();
      let name = await erc20Token.name();
      let decimals = await erc20Token.decimals();
      console.log(symbol, name, decimals.toString(), addr);
    }
  }).timeout(500000);
});
