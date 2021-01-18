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
  node: {
    url: 'http://39.102.101.142:8545',
    network_id: '1337',
    from: '0x855FA758c77D68a04990E992aA4dcdeF899F654A',
  }, // ganache
  aaveV2: {
    ethUsd: '380',
    tokenList: [
      {
        symbol: 'DAI',
        decimals: 18,
        priceEth: oneEth,
        address: '0xD9C83Dc682C5889F4C6030dccB6203799907b7A0',
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
        address: '0xEfc016f07a33639A2F6b90Aa3c9E8c559a4bE243',
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
        address: '0x2bEf0337c7a1491342083136E5251b3cD3f5d161',
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
        address: '0x373a03e772b2aE62480507bF9c97288f66bCdA81',
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
        address: '0x53249BBf6425C41153c0FCC7A74c2A4374eE7a3d',
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
