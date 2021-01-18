const newLocal = 'bignumber.js';
const BigNumber = require(newLocal);

let toRay = (num) => {
  const oneRay = new BigNumber(Math.pow(10, 27));
  return new BigNumber(num).multipliedBy(oneRay).toFixed();
};

const oneEth = new BigNumber(Math.pow(10, 18));
// strategy: {
//     optimalUtilizationRate:toRay(0.65),
//     baseVariableBorrowRate: toRay(0),
//     variableRateSlope1: toRay(0.08),
//     variableRateSlope2: toRay(0.6),
//     stableRateSlope1: toRay(0.6),
//     stableRateSlope2: toRay(1),
// }
module.exports = {
  aaveV2: {
    ethUsd: '380',
    tokenList: [
      {
        symbol: 'DAI',
        decimals: 18,
        priceEth: oneEth,
        address: '0x7C728214be9A0049e6a86f2137ec61030D0AA964',
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
      {
        symbol: 'BAT',
        decimals: 18,
        address: '0x86072CbFF48dA3C1F01824a6761A03F105BCC697',
        priceEth: oneEth.div(10),
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
      {
        symbol: 'WBTC',
        decimals: 8,
        priceEth: oneEth.times(100),
        address: '0x4bf749ec68270027C5910220CEAB30Cc284c7BA2',
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
      {
        symbol: 'USDT',
        decimals: 6,
        address: '0xA586074FA4Fe3E546A132a16238abe37951D41fE',
        priceEth: oneEth.div(1000),
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
      {
        symbol: 'USDC',
        decimals: 6,
        address: '0x970e8f18ebfEa0B08810f33a5A40438b9530FBCF',
        priceEth: oneEth.div(1000),
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
    ],
  },
};
