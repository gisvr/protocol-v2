const { BN } = require('ethereumjs-util');

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
    admin: '0x2E9D15d024187477F85Ac7cD7154aD8556EDb8E2',
    interestRateMode: {
      stable: '1',
      variable: '2',
    },
    lpProvideAddr: '0xFe5E95e198C50E34519179A8CE21B3b4bF5A2A16',
    ethUsd: '380',
    tokenList: [
      {
        symbol: 'WBTC',
        decimals: 8,
        priceEth: oneEth.times(100),
        address: '0x22474D350EC2dA53D717E30b96e9a2B7628Ede5b',
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
        symbol: 'DAI',
        decimals: 18,
        priceEth: oneEth,
        address: '0x18b9306737eaf6E8FC8e737F488a1AE077b18053',
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
        address: '0x6082731fdAba4761277Fb31299ebC782AD3bCf24',
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
        symbol: 'USDT',
        decimals: 6,
        address: '0x12080583C4F0211eC382d33a273E6D0f9fAb0F75',
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
        address: '0x92cfBAB5A86631e9F1A6126b42E01A74eadA61Df',
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
